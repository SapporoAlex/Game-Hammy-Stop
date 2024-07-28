import sys
import pygame
import csv
from player import Character
from assets import *
from ui import Bar
from circles import Circle
from nuts import Nut
import random as rd

pygame.init()
# pygame.mixer.init()

# Constants
WIDTH, HEIGHT = 1800, 1000
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
PURPLE = (10, 0, 90)
COBALT = (10, 0, 200)
BROWN = (120, 70, 40)
BEIGE = (200, 150, 120)
VALUE_COLOR = (15, 190, 255)  # Blue color for the filled portion
DETECTION_GREEN = (95, 255, 25)
BARBOX_COLOR = (100, 100, 100)  # Grey color for the background of the bar
BARBOX_SIZE = (600, 50)
GRID_SIZE = 100

window = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Hammy Stop")
clock = pygame.time.Clock()
speed = 5
font = pygame.font.SysFont('bahnschrift', 60)

# Load impassable tiles from CSV file
impassable_tiles = set()
with open('grid_config.csv') as f:
    reader = csv.reader(f)
    for y, row in enumerate(reader):
        for x, cell in enumerate(row):
            if cell == '1':
                impassable_tiles.add((x, y))


high_score_file = "highscore.txt"
try:
    with open(high_score_file, "r") as file:
        high_score = int(file.read())
except FileNotFoundError:
    high_score = 0


def draw_grid():
    window.fill(COBALT)
    border_rect = pygame.Rect(50, 100, 1700, 800)
    for x in range(50, WIDTH - 50, GRID_SIZE):
        for y in range(100, HEIGHT - 100, GRID_SIZE):
            rect = pygame.Rect(x, y, GRID_SIZE, GRID_SIZE)
            grid_x = (x - 50) // GRID_SIZE
            grid_y = (y - 50) // GRID_SIZE
            if (grid_x, grid_y) in impassable_tiles:
                window.blit(impassable_tile_image, (x, y))
            else:
                pygame.draw.rect(window, PURPLE, rect)  # Draw the filled rectangle
                pygame.draw.rect(window, BLACK, border_rect, 3)


def update_display():
    draw_grid()
    freeze_bar.display_freeze_bar(window, player.freeze_time)
    detection_bar.display_freeze_bar(window, player.detection)
    for nut in nuts:
        nut.draw(window)
        nut.update()
    for poop in poops:
        window.blit(poop['image'], (poop['x'], poop['y']))
    window.blit(player.image, (player.x, player.y))
    for circle in circle_list:
        circle.display_circle(window)
    display_text()
    pygame.display.flip()


def is_impassable(x, y):
    grid_x = x // GRID_SIZE
    grid_y = y // GRID_SIZE
    return (grid_x, grid_y) in impassable_tiles


def spawn_poop():
    poop_img = rd.choice(poop_imgs)
    poops.append({'image': poop_img, 'x': player.x, 'y': player.y})
    poop_sfx.play()


def set_timer():
    interval = rd.randint(10000, 30000)  # Time in milliseconds
    pygame.time.set_timer(pygame.USEREVENT, interval)


def display_text():
    score_text = font.render(f"NUTS: {score}", True, WHITE)
    window.blit(score_text, (50, 30))
    highscore_text = font.render(f"HI-SCORE: {high_score}", True, WHITE)
    window.blit(highscore_text, ((WIDTH - BARBOX_SIZE[0] / 1.5), 30))
    detection_text = font.render("DETECTION", True, BARBOX_COLOR)
    window.blit(detection_text, ((WIDTH - BARBOX_SIZE[0] - 50), (HEIGHT - 75)))
    freeze_text = font.render("FREEZE", True, BARBOX_COLOR)
    window.blit(freeze_text, (50, (HEIGHT - 75)))


def update_high_score(new_score):
    global high_score
    if new_score > high_score:
        high_score = new_score
        with open(high_score_file, "w") as file:
            file.write(str(high_score))


def lose(self):
    return main_menu()


def main_menu():
    in_main = True
    while in_main:
        window.fill(COBALT)
        menu_rect = pygame.Rect(200, 100, 1400, 700)
        pygame.draw.rect(window, PURPLE, menu_rect)
        window.blit(title, (300, 200))
        menu_text1 = font.render("Press Enter to Play", True, WHITE)
        menu_text2 = font.render("Press Esc to Quit", True, WHITE)
        window.blit(menu_text1, (600, 500))
        window.blit(menu_text2, (600, 600))
        if score > 0:
            menu_text3 = font.render(f"You got {score} nuts!", True, WHITE)
            window.blit(menu_text3, (600, 700))
        pygame.display.flip()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
        keys = pygame.key.get_pressed()
        if keys[pygame.K_RETURN]:
            running = True
            play()
        elif keys[pygame.K_ESCAPE]:
            pygame.quit()
            sys.exit()


# Initialize variables
def play():
    pygame.mixer.music.play(loops=-1)
    global detection_bar, freeze_bar, poops, running, nuts, circle1, circle2, circle3, score, player, circle_list
    running = True
    player = Character(50, 400, standing_imgs)
    freeze_bar = Bar(barbox_size=BARBOX_SIZE, barbox_color=BARBOX_COLOR, value_size=BARBOX_SIZE,
                     value_color=VALUE_COLOR, x=50, y=HEIGHT - 75)
    detection_bar = Bar(barbox_size=BARBOX_SIZE, barbox_color=BARBOX_COLOR, value_size=BARBOX_SIZE,
                        value_color=DETECTION_GREEN, x=(WIDTH - BARBOX_SIZE[0] - 50), y=HEIGHT - 75)
    circle1 = Circle('a', WIDTH / 2, HEIGHT / 2)
    circle2 = Circle('b', WIDTH / 2, HEIGHT / 2)
    circle3 = Circle('c', WIDTH / 2, HEIGHT / 2)
    score = 0
    nuts = []
    poops = []
    circle_list = [circle1, circle2, circle3]

    set_timer()
    nuts.append(Nut(400, 400))
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.USEREVENT:
                spawn_poop()  # Spawn p1 image when the timer event is triggered
                set_timer()  # Reset the timer

        keys = pygame.key.get_pressed()
        new_x, new_y = player.x, player.y
        if keys[pygame.K_LEFT] and player.x > 50 and not player.is_frozen:
            new_x -= speed
            player.move_left()
        elif keys[pygame.K_RIGHT] and player.x < (WIDTH - GRID_SIZE - 50) and not player.is_frozen:
            new_x += speed
            player.move_right()
        elif keys[pygame.K_UP] and player.y > 100 and not player.is_frozen:
            new_y -= speed
            player.move_up()
        elif keys[pygame.K_DOWN] and player.y < (HEIGHT - GRID_SIZE - 100) and not player.is_frozen:
            new_y += speed
            player.move_down()
        elif keys[pygame.K_SPACE] and player.freeze_time > 0:
            player.freeze()
            player.lower_freeze_time()
        elif keys[pygame.K_ESCAPE]:
            running = False
        else:
            player.is_frozen = False
            player.stand_still()

        # Check if the new position is impassable before moving the player
        if not is_impassable(new_x, new_y):
            player.x, player.y = new_x, new_y

        for nut in nuts:
            if nut.check_collision(player):
                score += 1
                nut_sfx.play()
                update_high_score(score)
                nuts.remove(nut)
                player.detection += 5
                player.freeze_time += 25
                if player.freeze_time > 100:
                    player.freeze_time = 100
                if player.detection > 100:
                    player.detection = 100

        for circle in circle_list:
            circle.update_rect()
            if circle.check_collision(player) and not player.is_frozen:
                player.detection -= 0.5
                alert_sfx.play()
                if player.detection < 0:
                    lose(player)
            if score >= 10 and len(circle_list) == 3:
                circle4 = Circle("a", WIDTH / 2, HEIGHT / 2)
                circle_list.append(circle4)
            if score >= 20 and len(circle_list) == 4:
                circle4 = Circle("b", 400, HEIGHT / 2)
                circle_list.append(circle4)
            if score >= 30 and len(circle_list) == 5:
                circle4 = Circle("c", WIDTH / 2, 300)
                circle_list.append(circle4)
            if score >= 40 and len(circle_list) == 6:
                circle4 = Circle("b", 800, HEIGHT / 2)
                circle_list.append(circle4)
            if score >= 50 and len(circle_list) == 7:
                circle4 = Circle("c", WIDTH / 2, 600)
                circle_list.append(circle4)

        if len(nuts) <= 2:
            nuts.append(Nut(rd.randrange(200, 1500, 100), (rd.randrange(200, 800, 100))))

        update_display()
        player.update_image()
        clock.tick(60)


if __name__ == "__main__":
    score = 0
    main_menu()

pygame.quit()
sys.exit()
