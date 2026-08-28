from pathlib import Path

from PIL import Image, ImageFilter, ImageOps


ROOT = Path(r"C:\Users\HP\Documents\uxdimeji")
SOURCE = Path(r"C:\Users\HP\Downloads\stead (1)")
OUTPUT = ROOT / "public" / "projects" / "stead"
BACKGROUND = OUTPUT / "stead-pair-background.png"

CANVAS_SIZE = (1800, 1350)
PAIR_MAX_HEIGHT = 1160
PAIR_GAP = 96

PAIRS = [
    ("dashboard", "Dashboard.png", "Dashboard-2.png"),
    ("dashboard-review", "Dashboard-1.png", "Dashboard dark mode - Modal.png"),
    ("schedule", "Schedule.png", "Schedule dark mode.png"),
    ("meeting-review", "Schedule-3.png", "Schedule-4.png"),
    ("memory", "Schedule-1.png", "Memory-1.png"),
    ("memory-detail", "Schedule-2.png", "Memory.png"),
    ("profile", "Profile.png", "Profile-1.png"),
    ("connections", "Connections.png", "Connections-1.png"),
    ("boundaries", "Boundaries.png", "Boundaries-1.png"),
    ("speaking-style", "Speaking Style.png", "Speaking Style-1.png"),
]


def make_canvas() -> Image.Image:
    source = Image.open(BACKGROUND).convert("RGB")
    canvas = ImageOps.fit(source, CANVAS_SIZE, method=Image.Resampling.LANCZOS)
    return canvas.convert("RGBA")


def resize_screen(path: Path, max_height: int) -> Image.Image:
    screen = Image.open(path).convert("RGBA")
    scale = max_height / screen.height
    size = (round(screen.width * scale), round(screen.height * scale))
    return screen.resize(size, Image.Resampling.LANCZOS)


def add_screen(canvas: Image.Image, screen: Image.Image, x: int, y: int) -> None:
    shadow = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    shadow_shape = Image.new("RGBA", screen.size, (0, 0, 0, 0))
    alpha = screen.getchannel("A")
    shadow_shape.putalpha(alpha)
    shadow.paste((20, 18, 32, 112), (x, y + 18), shadow_shape)
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(screen, (x, y))


def create_pair(name: str, light_file: str, dark_file: str) -> None:
    light = resize_screen(SOURCE / light_file, PAIR_MAX_HEIGHT)
    dark = resize_screen(SOURCE / dark_file, PAIR_MAX_HEIGHT)

    total_width = light.width + PAIR_GAP + dark.width
    start_x = (CANVAS_SIZE[0] - total_width) // 2
    light_y = (CANVAS_SIZE[1] - light.height) // 2
    dark_y = (CANVAS_SIZE[1] - dark.height) // 2

    canvas = make_canvas()
    add_screen(canvas, light, start_x, light_y)
    add_screen(canvas, dark, start_x + light.width + PAIR_GAP, dark_y)
    canvas.convert("RGB").save(
        OUTPUT / f"stead-{name}-light-dark.jpg",
        quality=94,
        subsampling=0,
        optimize=True,
    )


def create_standalone() -> None:
    screen = resize_screen(SOURCE / "Section.png", 1180)
    x = (CANVAS_SIZE[0] - screen.width) // 2
    y = (CANVAS_SIZE[1] - screen.height) // 2
    canvas = make_canvas()
    add_screen(canvas, screen, x, y)
    canvas.convert("RGB").save(
        OUTPUT / "stead-conversation.jpg",
        quality=94,
        subsampling=0,
        optimize=True,
    )


def create_splash_flow() -> None:
    splash_files = [
        "Splash AI in Your Stead.png",
        "Splash  Set the Script.png",
        "Splash Set the Script.png",
    ]
    screens = [resize_screen(Path(r"C:\Users\HP\Downloads") / name, 1120) for name in splash_files]
    gap = 42
    total_width = sum(screen.width for screen in screens) + gap * (len(screens) - 1)
    x = (CANVAS_SIZE[0] - total_width) // 2
    canvas = make_canvas()
    for screen in screens:
        y = (CANVAS_SIZE[1] - screen.height) // 2
        add_screen(canvas, screen, x, y)
        x += screen.width + gap
    canvas.convert("RGB").save(
        OUTPUT / "stead-splash-flow.jpg",
        quality=94,
        subsampling=0,
        optimize=True,
    )


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for pair in PAIRS:
        create_pair(*pair)
    create_standalone()
    create_splash_flow()
    print(f"Created {len(PAIRS) + 2} Stead presentation images in {OUTPUT}")


if __name__ == "__main__":
    main()
