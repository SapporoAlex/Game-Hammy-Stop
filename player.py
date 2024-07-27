from assets import *
import random as rd


class Character:
    def __init__(self, x, y, standing_imgs):
        self.x = x
        self.y = y
        self.width = 50
        self.height = 50
        self.standing_imgs = standing_imgs
        self.up_imgs = up_imgs
        self.down_imgs = down_imgs
        self.left_imgs = left_imgs
        self.right_imgs = right_imgs
        self.image = standing_imgs[0]
        self.f_image = [f1, f1]
        self.img_index = 0
        self.animation_counter = 0
        self.is_frozen = False
        self.freeze_time = 100
        self.detection = 100

    def update_image(self):
        self.animation_counter += 1
        if self.animation_counter >= 10:
            self.img_index = (self.img_index + 1) % 2
            self.animation_counter = 0
        self.image = self.current_imgs[self.img_index]

    def stand_still(self):
        self.current_imgs = self.standing_imgs

    def move_up(self):
        self.current_imgs = self.up_imgs

    def move_down(self):
        self.current_imgs = self.down_imgs

    def move_left(self):
        self.current_imgs = self.left_imgs

    def move_right(self):
        self.current_imgs = self.right_imgs

    def freeze(self):
        self.current_imgs = self.f_image
        self.is_frozen = True

    def lower_freeze_time(self):
        if self.freeze_time > 0:
            self.freeze_time -= 0.5

    def lose(self):
        return main_menu()
