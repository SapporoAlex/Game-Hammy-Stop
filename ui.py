import pygame


class Bar:
    def __init__(self, barbox_size, barbox_color, value_size, value_color, x, y):
        self.barbox_size = barbox_size  # Size of the bar's background
        self.barbox_color = barbox_color  # Color of the bar's background
        self.value_size = value_size  # Size of the bar's filled portion (value)
        self.value_color = value_color  # Color of the bar's filled portion
        self.x = x  # X position of the bar
        self.y = y  # Y position of the bar

    def display_freeze_bar(self, window, value):
        # Draw the background rectangle (the full size of the bar)
        pygame.draw.rect(window, self.barbox_color, (self.x, self.y, self.barbox_size[0], self.barbox_size[1]))

        # Compute the width of the filled portion based on the value
        value_width = value * 6
        # Ensure the value width does not exceed the maximum bar width
        value_width = min(value_width, self.barbox_size[0])

        # Draw the filled portion rectangle (value)
        pygame.draw.rect(window, self.value_color, (self.x, self.y, value_width, self.barbox_size[1]))
