from assets import *


class Nut:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.images = nut_images
        self.current_image_index = 0
        self.image = self.images[self.current_image_index]
        self.rect = self.image.get_rect(topleft=(x, y))
        self.animation_speed = 10  # Adjust animation speed if needed
        self.animation_counter = 0

    def update(self):
        # Update animation
        self.animation_counter += 1
        if self.animation_counter >= self.animation_speed:
            self.animation_counter = 0
            self.current_image_index = (self.current_image_index + 1) % len(self.images)
            self.image = self.images[self.current_image_index]
            self.rect = self.image.get_rect(topleft=(self.x, self.y))

    def draw(self, surface):
        surface.blit(self.image, (self.x, self.y))

    def check_collision(self, player):
        return self.rect.colliderect(pygame.Rect(player.x, player.y, player.width, player.height))
