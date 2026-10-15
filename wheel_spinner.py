import random
import time


class WheelSpinner:

  def __init__(self, num_players):
    self.num_players = num_players
    self.allocations = {}

  def execute_secret_spins(self):
    print("--- STARTING SECRET WHEEL SPINS ---")
    for player_id in range(1, self.num_players + 1):
      assigned_number = random.randint(1, 9)
      self.allocations[player_id] = assigned_number
      print(
          f"Player {player_id} spun the wheel! [Number Hidden from Opponents]"
      )
    return self.allocations