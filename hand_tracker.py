import cv2
import numpy as np


class HandTracker:

  def __init__(self):
    # Using HSV color tracking to track a bright marker/cap on your finger.
    # This completely eliminates MediaPipe version and Python 3.14 errors!
    self.drawing_path = []

  def process_frame(self, frame):
    # Convert frame to HSV color space
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # Define color range for a bright green marker/cap
    # (You can hold a green pen cap or sticker in front of the camera)
    lower_color = np.array([35, 100, 100])
    upper_color = np.array([85, 255, 255])

    mask = cv2.inRange(hsv, lower_color, upper_color)

    # Clean up noise
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    # Find contours of the colored marker
    contours, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    cursor_pos = None
    if contours:
      # Get the largest contour (the marker)
      c = max(contours, key=cv2.contourArea)
      if cv2.contourArea(c) > 300:  # Minimum size threshold
        ((x, y), radius) = cv2.minEnclosingCircle(c)
        if radius > 4:
          cursor_pos = (int(x), int(y))
          self.drawing_path.append(cursor_pos)

    return frame, cursor_pos, self.drawing_path