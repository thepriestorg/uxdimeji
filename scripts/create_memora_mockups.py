from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageOps


SOURCE = Path(r"C:\Users\HP\Downloads\Untitled (1)")
BACKGROUND = Path(r"C:\Users\HP\AppData\Local\Temp\codex-clipboard-d3894488-1d4f-4f49-a304-4a8d9bcb08fc.png")
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "projects" / "memora"
CANVAS = (1800, 1350)


def load_screen(name: str) -> Image.Image:
    image = Image.open(SOURCE / name).convert("RGBA")
    if name in {"393w default-1.png", "Body-1.png"}:
        return image.crop((132, 0, 918, 1708))
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    return image.crop(bounds) if bounds else image


def backdrop() -> Image.Image:
    image = Image.open(BACKGROUND).convert("RGB")
    return ImageOps.fit(image, CANVAS, method=Image.Resampling.LANCZOS).convert("RGBA")


def fit(image: Image.Image, max_width: int, max_height: int) -> Image.Image:
    scale = min(max_width / image.width, max_height / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS)


def rounded_with_stroke(image: Image.Image) -> Image.Image:
    width, height = image.size
    radius = 20
    stroke = 5
    mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, width - 1, height - 1),
        radius=radius,
        fill=255,
    )
    framed = Image.new("RGBA", image.size, (0, 0, 0, 0))
    framed.alpha_composite(image)
    framed.putalpha(ImageChops.multiply(framed.getchannel("A"), mask))

    border = Image.new("RGBA", image.size, (0, 0, 0, 0))
    ImageDraw.Draw(border).rounded_rectangle(
        (stroke // 2, stroke // 2, width - 1 - stroke // 2, height - 1 - stroke // 2),
        radius=radius,
        outline=(255, 255, 255, 51),
        width=stroke,
    )
    return Image.alpha_composite(framed, border)


def compose(name: str, screens: list[str], index: int) -> None:
    canvas = backdrop()
    count = len(screens)
    if count == 1:
        max_width, max_height, gap = 660, 1190, 0
    elif count == 2:
        max_width, max_height, gap = 610, 1110, 110
    else:
        max_width, max_height, gap = 480, 1040, 48

    fitted = [rounded_with_stroke(fit(load_screen(screen), max_width, max_height)) for screen in screens]
    total_width = sum(image.width for image in fitted) + gap * (count - 1)
    x = (CANVAS[0] - total_width) // 2

    for position, image in enumerate(fitted):
        y = (CANVAS[1] - image.height) // 2
        if count > 1:
            y += (-26 if position % 2 == 0 else 26)
        if count == 3:
            y += (20 if position == 1 else -10)
        canvas.alpha_composite(image, (x, y))
        x += image.width + gap

    OUTPUT.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUTPUT / name, quality=94, subsampling=0, optimize=True)


def main() -> None:
    groups = [
        ("memora-memory-library.jpg", ["memories.png"]),
        ("memora-search-notifications.jpg", ["memories-1.png", "memories-2.png"]),
        ("memora-memory-story.jpg", ["393w default.png", "393w default-2.png"]),
        ("memora-places-map.jpg", ["Places.png"]),
        ("memora-place-details.jpg", ["Places-1.png", "Places-2.png"]),
        ("memora-profile.jpg", ["Profile.png"]),
        ("memora-people-invite.jpg", ["Profile-2.png", "Profile-3.png"]),
        ("memora-invitation-feedback.jpg", ["Profile-1.png"]),
        ("memora-moment-detail.jpg", ["Body.png"]),
        ("memora-memory-controls.jpg", ["393w default-1.png", "Body-1.png"]),
        ("memora-create-memory-flow.jpg", ["Body-2.png", "Body-3.png", "Body-4.png"]),
    ]
    for index, (name, screens) in enumerate(groups):
        compose(name, screens, index)


if __name__ == "__main__":
    main()
