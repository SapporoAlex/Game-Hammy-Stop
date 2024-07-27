import pygame


class Circle:
    def __init__(self, type, x, y):
        self.circle_radius = 100
        self.circle_surface = pygame.Surface((self.circle_radius * 2, self.circle_radius * 2), pygame.SRCALPHA)
        self.rect = self.circle_surface.get_rect(topleft=(x, y))
        self.circle_color = (255, 0, 0, 128)
        pygame.draw.circle(self.circle_surface, self.circle_color, (self.circle_radius, self.circle_radius), self.circle_radius)
        self.x = x
        self.y = y
        self.angle = 0
        self.speed = 0.02  # Decrease this value to slow down the circular motion
        self.dir = 1
        if type == "a":
            self.dir = "u"

    def update_rect(self):
        self.rect = pygame.Rect(self.x - self.circle_radius, self.y - self.circle_radius, self.circle_radius * 2, self.circle_radius * 2)

    def display_circle(self, window, type):
        if type == 'a':
            if self.y <= 200 and self.dir == "u":
                self.dir = "l"
            elif self.x <= 300 and self.dir == "l":
                self.dir = "d"
            elif self.y >= 800 and self.dir == "d":
                self.dir = "r"
            elif self.x == 1500 and self.dir == "r":
                self.dir = "u"

            if self.dir == "u":
                self.y -= 5
            elif self.dir == "l":
                self.x -= 5
            elif self.dir == "d":
                self.y += 5
            elif self.dir == "r":
                self.x += 5

        elif type == 'b':
            if self.y >= 750:
                self.dir = -1
            elif self.y <= 200:
                self.dir = 1
            self.y += 5 * self.dir
        elif type == 'c':
            if self.x >= 1600:
                self.dir = -1
            elif self.x <= 300:
                self.dir = 1
            self.x += 5 * self.dir

        window.blit(self.circle_surface, (self.x - self.circle_radius, self.y - self.circle_radius))

    def check_collision(self, player):
        return self.rect.colliderect(pygame.Rect(player.x, player.y, player.width, player.height))
