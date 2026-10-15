import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Custom React hook for real-time Index Fingertip Tracking with MediaPipe Hands.
 * Robust fallback to Mouse/Touch mode for multi-tab local testing or camera lockouts.
 */
export function useHandTracker({ onPointTracked, isTracingEnabled = true }) {
  const videoRef = useRef(null);
  const cameraInstanceRef = useRef(null);
  const handsInstanceRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [cursorPos, setCursorPos] = useState(null); // { x, y } in canvas coordinates
  const [inputMode, setInputMode] = useState("camera"); // 'camera' | 'mouse'
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");

  // Enumerate cameras
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(d => d.kind === "videoinput");
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0 && !selectedCameraId) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
      }).catch(err => {
        console.warn("Could not enumerate camera devices:", err);
      });
    }
  }, []);

  // Initialize MediaPipe Hands
  const initMediaPipe = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setCameraError(null);

      // Access Hands constructor from window (CDN) or npm package
      const HandsConstructor = window.Hands || (await import("@mediapipe/hands")).Hands;
      const CameraConstructor = window.Camera || (await import("@mediapipe/camera_utils")).Camera;

      if (!HandsConstructor || !CameraConstructor) {
        throw new Error("MediaPipe Hands library failed to load");
      }

      const hands = new HandsConstructor({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });

      hands.onResults((results) => {
        if (!isTracingEnabled) return;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          setIsHandDetected(true);
          const landmarks = results.multiHandLandmarks[0];
          // Landmark 8 = INDEX_FINGER_TIP
          const indexTip = landmarks[8];
          // Landmark 6 = INDEX_FINGER_PIP (check if extended)
          const indexPip = landmarks[6];

          if (indexTip) {
            // Note: Camera feed is mirrored horizontally for intuitive drawing
            const videoElem = videoRef.current;
            const width = videoElem?.videoWidth || 640;
            const height = videoElem?.videoHeight || 480;

            const normalizedX = (1 - indexTip.x) * width;
            const normalizedY = indexTip.y * height;

            const point = { x: normalizedX, y: normalizedY };
            setCursorPos(point);

            // Trigger point callback
            if (onPointTracked) {
              onPointTracked(point, true);
            }
          }
        } else {
          setIsHandDetected(false);
          setCursorPos(null);
        }
      });

      handsInstanceRef.current = hands;

      // Start webcam stream via Camera utility
      const camera = new CameraConstructor(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsInstanceRef.current && inputMode === "camera") {
            await handsInstanceRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
        deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined
      });

      await camera.start();
      cameraInstanceRef.current = camera;
      setIsCameraActive(true);
      console.log("Webcam & MediaPipe Hands tracker initialized successfully!");

    } catch (err) {
      console.error("Camera / MediaPipe initialization failed:", err);
      let userFriendlyMsg = "Could not start camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        userFriendlyMsg = "Camera access denied. Please allow camera permissions in your browser.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        userFriendlyMsg = "Camera is already in use by another tab or app. Switching to Mouse / Touch Mode.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        userFriendlyMsg = "No webcam detected on this device. Switching to Mouse / Touch Mode.";
      }
      setCameraError(userFriendlyMsg);
      setIsCameraActive(false);
      // Auto-fallback to mouse mode so game is 100% playable
      setInputMode("mouse");
    }
  }, [inputMode, isTracingEnabled, onPointTracked, selectedCameraId]);

  // Start tracking when component mounts or camera changes
  useEffect(() => {
    if (inputMode === "camera") {
      initMediaPipe();
    } else {
      // Clean up camera if switched to mouse mode
      if (cameraInstanceRef.current) {
        try { cameraInstanceRef.current.stop(); } catch (e) {}
      }
      setIsCameraActive(false);
    }

    return () => {
      if (cameraInstanceRef.current) {
        try { cameraInstanceRef.current.stop(); } catch (e) {}
      }
      if (handsInstanceRef.current) {
        try { handsInstanceRef.current.close(); } catch (e) {}
      }
    };
  }, [inputMode, selectedCameraId, initMediaPipe]);

  // Mouse & Touch Fallback Handlers
  const handlePointerDown = useCallback((e) => {
    if (inputMode !== "mouse" || !isTracingEnabled) return;
    setIsMouseDown(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * (e.currentTarget.width || 1280);
    const y = ((e.clientY - rect.top) / rect.height) * (e.currentTarget.height || 720);
    const pt = { x, y };
    setCursorPos(pt);
    if (onPointTracked) onPointTracked(pt, true);
  }, [inputMode, isTracingEnabled, onPointTracked]);

  const handlePointerMove = useCallback((e) => {
    if (inputMode !== "mouse" || !isTracingEnabled || !isMouseDown) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * (e.currentTarget.width || 1280);
    const y = ((e.clientY - rect.top) / rect.height) * (e.currentTarget.height || 720);
    const pt = { x, y };
    setCursorPos(pt);
    if (onPointTracked) onPointTracked(pt, true);
  }, [inputMode, isMouseDown, isTracingEnabled, onPointTracked]);

  const handlePointerUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  return {
    videoRef,
    isCameraActive,
    cameraError,
    isHandDetected,
    cursorPos,
    inputMode,
    setInputMode,
    availableCameras,
    selectedCameraId,
    setSelectedCameraId,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp
    }
  };
}
