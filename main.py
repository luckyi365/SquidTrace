import sys
import cv2
import numpy as np
from hand_tracker import HandTracker
from shape_matcher import ShapeMatcher
from wheel_spinner import WheelSpinner


def draw_top_right_preview(frame, level):
  h, w, c = frame.shape
  # Top-right corner container coordinates
  box_x1, box_y1 = w - 180, 20
  box_x2, box_y2 = w - 20, 180

  # Cinematic Palette Colors (BGR format derived from your palette)
  bg_color = (80, 73, 2)  # Deep Teal (#024950)
  border_color = (175, 164, 15)  # Vibrant Cyan/Teal (#0FA4AF)
  shape_color = (229, 221, 175)  # Ice Blue (#AFDDE5)
  accent_rust = (52, 71, 150)  # Rust Brown (#964734)

  # Draw background container box
  cv2.rectangle(frame, (box_x1, box_y1), (box_x2, box_y2), bg_color, -1)
  cv2.rectangle(frame, (box_x1, box_y1), (box_x2, box_y2), border_color, 2)

  cx = (box_x1 + box_x2) // 2
  cy = (box_y1 + box_y2) // 2 + 5

  # Dictionary mapping all 9 shapes to their detailed visual renderers
  shape_names = {
      1: "Rhombus",
      2: "Star",
      3: "Triangular Prism",
      4: "Pentagonal Pyramid",
      5: "Umbrella",
      6: "Butterfly",
      7: "Octagram",
      8: "Nonagon",
      9: "Icosahedron",
  }

  shape_name = shape_names.get(level, "Shape")

  # --- DETAILED RENDERERS FOR ALL 9 SHAPES ---
  if level == 1:  # Rhombus
    pts = np.array(
        [[cx, cy - 35], [cx + 30, cy], [cx, cy + 35], [cx - 30, cy]], np.int32
    )
    cv2.polylines(frame, [pts], True, shape_color, 2)

  elif level == 2:  # Star (5-point)
    pts = np.array(
        [
            [cx, cy - 40],
            [cx + 12, cy - 10],
            [cx + 40, cy - 10],
            [cx + 18, cy + 10],
            [cx + 26, cy + 38],
            [cx, cy + 20],
            [cx - 26, cy + 38],
            [cx - 18, cy + 10],
            [cx - 40, cy - 10],
            [cx - 12, cy - 10],
        ],
        np.int32,
    )
    cv2.polylines(frame, [pts], True, shape_color, 2)

  elif level == 3:  # Triangular Prism
    front = np.array(
        [[cx, cy - 30], [cx + 25, cy + 20], [cx - 25, cy + 20]], np.int32
    )
    cv2.polylines(frame, [front], True, shape_color, 2)
    back_offset = 15
    back = np.array(
        [
            [cx + back_offset, cy - 40],
            [cx + 40, cy + 10],
            [cx - 10, cy + 10],
        ],
        np.int32,
    )
    cv2.polylines(frame, [back], True, accent_rust, 1)
    cv2.line(frame, (cx, cy - 30), (cx + back_offset, cy - 40), accent_rust, 1)
    cv2.line(frame, (cx + 25, cy + 20), (cx + 40, cy + 10), accent_rust, 1)
    cv2.line(frame, (cx - 25, cy + 20), (cx - 10, cy + 10), accent_rust, 1)

  elif level == 4:  # Pentagonal Pyramid
    base = np.array(
        [
            [cx, cy + 30],
            [cx + 25, cy + 15],
            [cx + 15, cy - 5],
            [cx - 15, cy - 5],
            [cx - 25, cy + 15],
        ],
        np.int32,
    )
    cv2.polylines(frame, [base], True, shape_color, 2)
    peak = (cx, cy - 35)
    for pt in base:
      cv2.line(frame, tuple(pt), peak, accent_rust, 1)

  elif level == 5:  # Umbrella (Squid Game classic)
    cv2.ellipse(
        frame, (cx, cy - 10), (35, 20), 0, 180, 360, shape_color, 2
    )
    cv2.line(frame, (cx, cy + 10), (cx, cy + 35), shape_color, 2)
    cv2.circle(frame, (cx - 5, cy + 35), 5, shape_color, 2)

  elif level == 6:  # Butterfly
    cv2.ellipse(frame, (cx - 18, cy - 10), (18, 25), 30, 0, 360, shape_color, 2)
    cv2.ellipse(frame, (cx + 18, cy - 10), (18, 25), -30, 0, 360, shape_color, 2)
    cv2.ellipse(frame, (cx - 12, cy + 15), (12, 15), -30, 0, 360, shape_color, 2)
    cv2.ellipse(frame, (cx + 12, cy + 15), (12, 15), 30, 0, 360, shape_color, 2)
    cv2.line(frame, (cx, cy - 25), (cx, cy + 25), accent_rust, 2)

  elif level == 7:  # Octagram (8-pointed star / dual squares)
    pts1 = np.boxPoints(((cx, cy), (50, 50), 0)).astype(int)
    pts2 = np.boxPoints(((cx, cy), (50, 50), 45)).astype(int)
    cv2.polylines(frame, [pts1], True, shape_color, 2)
    cv2.polylines(frame, [pts2], True, accent_rust, 2)

  elif level == 8:  # Nonagon (9-sided polygon)
    angles = np.linspace(0, 2 * np.pi, 10)[:-1]
    r = 32
    pts = np.array(
        [[int(cx + r * np.cos(a)), int(cy + r * np.sin(a))] for a in angles],
        np.int32,
    )
    cv2.polylines(frame, [pts], True, shape_color, 2)

  elif level == 9:  # Icosahedron (Complex multi-triangle 3D solid)
    hex_angles = np.linspace(0, 2 * np.pi, 7)[:-1]
    r = 35
    outer = np.array(
        [
            [int(cx + r * np.cos(a)), int(cy + r * np.sin(a))]
            for a in hex_angles
        ],
        np.int32,
    )
    cv2.polylines(frame, [outer], True, shape_color, 2)
    cv2.circle(frame, (cx, cy), 15, accent_rust, 1)
    for pt in outer:
      cv2.line(frame, (cx, cy), tuple(pt), accent_rust, 1)
      cv2.line(frame, (cx, cy - 15), tuple(pt), accent_rust, 1)

  # Labels styled with the color palette
  cv2.putText(
      frame,
      "TARGET",
      (box_x1 + 45, box_y1 - 6),
      cv2.FONT_HERSHEY_SIMPLEX,
      0.5,
      border_color,
      1,
  )
  cv2.putText(
      frame,
      f"Lvl {level}: {shape_name}",
      (box_x1 - 10, box_y2 + 22),
      cv2.FONT_HERSHEY_SIMPLEX,
      0.5,
      shape_color,
      1,
  )


def run_squid_game():
  print("=== SQUID TRACE: GESTURE SURVIVAL ===")

  spinner = WheelSpinner(1)
  player_shapes = spinner.execute_secret_spins()
  active_level = player_shapes[1]

  print(f"Allocated Shape Level: {active_level}")
  print("Starting game window... Replicate the detailed shape preview!")

  cap = cv2.VideoCapture(0)
  tracker = HandTracker()
  matcher = ShapeMatcher()

  game_active = True
  while cap.isOpened() and game_active:
    success, frame = cap.read()
    if not success:
      break

    frame = cv2.flip(frame, 1)
    frame, cursor_pos, path = tracker.process_frame(frame)

    # Render target preview thumbnail card
    draw_top_right_preview(frame, active_level)

    if cursor_pos:
      cv2.circle(
          frame, cursor_pos, 8, (52, 71, 150), -1
      )  # Rust cursor marker
      cv2.putText(
          frame,
          "TRACING...",
          (cursor_pos[0] + 10, cursor_pos[1] - 10),
          cv2.FONT_HERSHEY_SIMPLEX,
          0.5,
          (175, 164, 15),
          2,
      )

    for i in range(1, len(path)):
      cv2.line(
          frame, path[i - 1], path[i], (175, 164, 15), 3
      )  # Teal/Cyan trace line

    accuracy = matcher.evaluate_drawing(path, active_level)

    cv2.putText(
        frame,
        f"Accuracy: {int(accuracy * 100)}%",
        (30, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (175, 164, 15),
        2,
    )
    cv2.putText(
        frame,
        "Press 'q' to Quit",
        (30, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (229, 221, 175),
        1,
    )

    cv2.imshow("Squid Gesture Survival", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
      break

  cap.release()
  cv2.destroyAllWindows()


if __name__ == "__main__":
  run_squid_game()

  