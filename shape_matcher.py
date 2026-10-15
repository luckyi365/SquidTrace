import cv2
import numpy as np


class ShapeMatcher:

  def __init__(self):
    # Mapping shapes to their required geometric vertex count for strict matching
    self.shape_configs = {
        1: {"name": "Rhombus", "target_vertices": 4, "threshold": 0.75},
        2: {"name": "Star", "target_vertices": 10, "threshold": 0.75},
        3: {"name": "Triangular Prism", "target_vertices": 6, "threshold": 0.80},
        4: {"name": "Pentagonal Pyramid", "target_vertices": 6, "threshold": 0.80},
        5: {"name": "Umbrella", "target_vertices": 5, "threshold": 0.82},
        6: {"name": "Butterfly", "target_vertices": 8, "threshold": 0.85},
        7: {"name": "Octagram", "target_vertices": 8, "threshold": 0.88},
        8: {"name": "Nonagon", "target_vertices": 9, "threshold": 0.90},
        9: {"name": "Icosahedron", "target_vertices": 12, "threshold": 0.92},
    }

  def evaluate_drawing(self, user_path, level):
    if len(user_path) < 25:
      return 0.0  # Too short

    path_array = np.array(user_path, dtype=np.int32)

    # Calculate bounding box to ensure drawing is a reasonable size
    x_min, x_max = np.min(path_array[:, 0]), np.max(path_array[:, 0])
    y_min, y_max = np.min(path_array[:, 1]), np.max(path_array[:, 1])
    area = (x_max - x_min) * (y_max - y_min)
    if area < 2000:
      return 0.1  # Drawing is too small

    # Use OpenCV contour approximation to count vertices/corners drawn by user
    epsilon = 0.02 * cv2.arcLength(path_array, True)
    approx = cv2.approxPolyDP(path_array, epsilon, True)
    user_vertices = len(approx)

    target_v = self.shape_configs[level]["target_vertices"]

    # Strict penalty if vertex count doesn't match the target shape
    vertex_diff = abs(user_vertices - target_v)
    if vertex_diff > 4:
      return round(
          max(0.05, 0.3 - (vertex_diff * 0.05)), 2
      )  # Low score for wrong shape

    # Calculate accuracy based on how close the vertex structure is
    accuracy = max(0.2, 1.0 - (vertex_diff / (target_v + 1.0)))
    return round(accuracy, 2)