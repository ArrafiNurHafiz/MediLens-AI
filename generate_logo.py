import os
from PIL import Image, ImageDraw, ImageFilter

def create_medilens_logo(size=512):
    # Create RGBA image with dark background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer squircle / background
    margin = size * 0.04
    bg_box = [margin, margin, size - margin, size - margin]
    corner_radius = size * 0.22
    
    # Gradient-like background (dark navy to pure black)
    draw.rounded_rectangle(bg_box, radius=corner_radius, fill=(9, 13, 22, 255), outline=(37, 99, 235, 180), width=int(size * 0.02))
    
    # Lens Outer Aperture Ring (Cyan / Blue Glowing)
    center = size / 2
    r_outer = size * 0.36
    r_inner = size * 0.29
    
    # Circular Lens Ring
    lens_box = [center - r_outer, center - r_outer, center + r_outer, center + r_outer]
    draw.ellipse(lens_box, outline=(14, 165, 233, 220), width=int(size * 0.025))
    
    # Sound waves (Audio-first accessibility arcs on left and right)
    arc_dist = size * 0.42
    # Left sound wave
    draw.arc([center - arc_dist, center - size * 0.2, center - arc_dist + size * 0.3, center + size * 0.2], 
             start=130, end=230, fill=(255, 230, 0, 240), width=int(size * 0.028))
    # Right sound wave
    draw.arc([center + arc_dist - size * 0.3, center - size * 0.2, center + arc_dist, center + size * 0.2], 
             start=310, end=50, fill=(255, 230, 0, 240), width=int(size * 0.028))
             
    # Inner glowing eye/cross
    # Stylized Pill / Cross in center
    pill_w = size * 0.16
    pill_h = size * 0.38
    
    # Pill capsule rotated 45 degrees or upright
    # Let's draw modern angled capsule
    pill_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(pill_img)
    
    # Capsule base centered
    c_x, c_y = size / 2, size / 2
    pw, ph = size * 0.14, size * 0.36
    
    # Draw two halves of capsule
    # Top half (Emerald / Cyan)
    p_draw.rounded_rectangle(
        [c_x - pw, c_y - ph/2, c_x + pw, c_y],
        radius=pw,
        fill=(16, 185, 129, 255) # Emerald
    )
    # Bottom half (Luminous Yellow / Amber for accessibility)
    p_draw.rounded_rectangle(
        [c_x - pw, c_y, c_x + pw, c_y + ph/2],
        radius=pw,
        fill=(255, 230, 0, 255) # WCAG High-Contrast Yellow
    )
    
    # Pill divider line
    p_draw.line([c_x - pw, c_y, c_x + pw, c_y], fill=(9, 13, 22, 255), width=int(size * 0.018))
    
    # Rotate pill by 45 degrees
    rotated_pill = pill_img.rotate(45, resample=Image.Resampling.BICUBIC, center=(c_x, c_y))
    
    # Composite
    img = Image.alpha_composite(img, rotated_pill)
    draw = ImageDraw.Draw(img)
    
    # Center sparkle / focal point
    sparkle_r = size * 0.025
    draw.ellipse([c_x - sparkle_r, c_y - sparkle_r, c_x + sparkle_r, c_y + sparkle_r], fill=(255, 255, 255, 255))
    
    return img

def create_round_logo(size=512):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    margin = size * 0.04
    center = size / 2
    r = (size - 2 * margin) / 2
    
    draw.ellipse([center - r, center - r, center + r, center + r], fill=(9, 13, 22, 255), outline=(255, 230, 0, 240), width=int(size * 0.025))
    
    # Sound waves
    arc_dist = size * 0.38
    draw.arc([center - arc_dist, center - size * 0.22, center - arc_dist + size * 0.3, center + size * 0.22], 
             start=130, end=230, fill=(255, 230, 0, 240), width=int(size * 0.028))
    draw.arc([center + arc_dist - size * 0.3, center - size * 0.22, center + arc_dist, center + size * 0.22], 
             start=310, end=50, fill=(255, 230, 0, 240), width=int(size * 0.028))
             
    # Pill
    pill_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(pill_img)
    pw, ph = size * 0.14, size * 0.36
    p_draw.rounded_rectangle([center - pw, center - ph/2, center + pw, center], radius=pw, fill=(16, 185, 129, 255))
    p_draw.rounded_rectangle([center - pw, center, center + pw, center + ph/2], radius=pw, fill=(255, 230, 0, 255))
    p_draw.line([center - pw, center, center + pw, center], fill=(9, 13, 22, 255), width=int(size * 0.018))
    
    rotated_pill = pill_img.rotate(45, resample=Image.Resampling.BICUBIC, center=(center, center))
    img = Image.alpha_composite(img, rotated_pill)
    draw = ImageDraw.Draw(img)
    
    sparkle_r = size * 0.025
    draw.ellipse([center - sparkle_r, center - sparkle_r, center + sparkle_r, center + sparkle_r], fill=(255, 255, 255, 255))
    return img

def main():
    densities = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }
    
    res_base = 'android/app/src/main/res'
    master_logo = create_medilens_logo(512)
    master_round = create_round_logo(512)
    
    # Ensure assets dir
    os.makedirs('assets/images', exist_ok=True)
    master_logo.save('assets/images/logo.png')
    
    for folder, dim in densities.items():
        out_dir = os.path.join(res_base, folder)
        os.makedirs(out_dir, exist_ok=True)
        
        icon = master_logo.resize((dim, dim), Image.Resampling.LANCZOS)
        icon.save(os.path.join(out_dir, 'ic_launcher.png'))
        
        round_icon = master_round.resize((dim, dim), Image.Resampling.LANCZOS)
        round_icon.save(os.path.join(out_dir, 'ic_launcher_round.png'))
        
    print("Launcher icons and in-app logo generated successfully!")

if __name__ == '__main__':
    main()
