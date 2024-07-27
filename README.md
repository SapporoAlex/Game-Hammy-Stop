# Hammy Stop

<img src="https://github.com/SapporoAlex/Game-Hammy-Stop/blob/main/images/preview.jpg" width="500px" height="auto">
**Hammy Stop** is a 2D game developed using Python and Pygame. The player controls a character named Hammy, who must navigate through a grid, collect nuts, avoid impassable tiles, and manage freeze and detection bars to achieve the highest score.

## Features

- **Grid-based Navigation:** Navigate Hammy through a map, with certain tiles being impassable.
- **Nut Collection:** Collect nuts to increase the score and manage detection and freeze bars.
- **Animated Characters and Objects:** Includes an animated hamster and nuts.
- **Random Events:** Poop spawns randomly on the grid.
- **High Score Tracking:** Keeps track of the highest score achieved.
- **Red Circles** Stay out of the red circles to avoid detection. Holding space will allow Hammy to avoid detection.

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/game-hammy-stop.git
    cd game-hammy-stop
    ```

2. **Install dependencies:**
    ```sh
    pip install pygame
    ```

3. **Run the game:**
    ```sh
    main.py
    ```

## Files Overview

### `main.py`
The main game loop and logic, including:
- Initialization of the game window and constants.
- Loading impassable tiles from a CSV file.
- Functions for drawing the grid, updating the display, and handling events.
- Main game loop for character movement, collision detection, and score updating.

### `nuts.py`
Defines the `Nut` class, which represents collectible nuts in the game:
- Handles nut animation and collision detection with the player.

### `circles.py`
Defines the `Circle` class, which represents moving circles in the game:
- Handles circular motion, drawing, and collision detection.

### `ui.py`
Defines the `Bar` class, used for displaying freeze and detection bars:
- Handles drawing and updating the bars based on the player's state.

### `player.py`
Defines the `Character` class, representing the player-controlled character:
- Handles character animation, movement, freezing, and updating the freeze time and detection.

### `assets.py`
Loads and manages game assets, including images for the player, nuts, and other objects.

## How to Play

- Use the arrow keys to move Hammy around the grid.
- Collect nuts to increase your score and manage your freeze and detection bars.
- Avoid impassable tiles and moving circles.
- Press the spacebar to use the freeze ability when needed.
- Try to achieve the highest score possible!

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.
