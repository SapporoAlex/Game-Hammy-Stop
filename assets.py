import pygame
pygame.mixer.init()
pygame.mixer.music.load("audio/bgm.mp3")

s1 = pygame.image.load("images/s1.png")
s2 = pygame.image.load("images/s2.png")
um1 = pygame.image.load("images/um1.png")
um2 = pygame.image.load("images/um2.png")
dm1 = pygame.image.load("images/dm1.png")
dm2 = pygame.image.load("images/dm2.png")
lm1 = pygame.image.load("images/lm1.png")
lm2 = pygame.image.load("images/lm2.png")
rm1 = pygame.image.load("images/rm1.png")
rm2 = pygame.image.load("images/rm2.png")
f1 = pygame.image.load("images/f1.png")
n1 = pygame.image.load("images/n1.png")
n2 = pygame.image.load("images/n2.png")
n3 = pygame.image.load("images/n3.png")
n4 = pygame.image.load("images/n4.png")
n5 = pygame.image.load("images/n5.png")
n6 = pygame.image.load("images/n6.png")
n7 = pygame.image.load("images/n7.png")
n8 = pygame.image.load("images/n8.png")
p1 = pygame.image.load("images/p1.png")
p2 = pygame.image.load("images/p2.png")
p3 = pygame.image.load("images/p3.png")
title = pygame.image.load("images/title.png")

nut_images = [pygame.image.load(f"images/n{i}.png") for i in range(1, 9)]
impassable_tile_image = pygame.image.load('images/i1.png')

nut_sfx = pygame.mixer.Sound("audio/nut.mp3")
poop_sfx = pygame.mixer.Sound("audio/poop.mp3")
alert_sfx = pygame.mixer.Sound("audio/alert.mp3")


standing_imgs = [s1, s2]
up_imgs = [um1, um2]
down_imgs = [dm1, dm2]
left_imgs = [lm1, lm2]
right_imgs = [rm1, rm2]
poop_imgs = [p1, p2, p3]
