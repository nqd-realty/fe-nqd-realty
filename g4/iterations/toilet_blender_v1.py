"""
GREENEYE NURSERY — COMMON TOILET 3D MODEL
Blender Python Script — v4 Final Layout
=========================================
9ft (E-W) × 6ft (N-S) × 10ft height
WC on West wall (faces East) | Glass partition | Door (S-hinged)
Urinal on South wall | Handwash on East wall (faces East) | Shower SE
Geyser on East wall above handwash

HOW TO USE:
1. Open Blender (2.8+ / 3.x / 4.x)
2. Go to Scripting workspace (or open a Text Editor panel)
3. Click "New" to create a new text block
4. Paste this entire script
5. Click "Run Script" (▶ button) or press Alt+P
6. Switch to the 3D Viewport — the model is ready
7. Press Numpad 0 for camera view, F12 to render

UNITS: 1 Blender unit = 1 foot
"""

import bpy
import math
from mathutils import Vector

# ============================================================
# CLEANUP — remove default objects
# ============================================================
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Remove orphan data
for block in bpy.data.meshes:
    if block.users == 0:
        bpy.data.meshes.remove(block)
for block in bpy.data.materials:
    if block.users == 0:
        bpy.data.materials.remove(block)

# ============================================================
# CONSTANTS
# ============================================================
ROOM_W = 9.0    # E-W (X axis)
ROOM_D = 6.0    # N-S (Y axis) — North = +Y, South = -Y (Blender convention)
ROOM_H = 10.0   # Height (Z axis)
WALL_T = 0.375  # 4.5 inch walls
FT = 1.0        # 1 unit = 1 foot

# We'll place the room so that:
# West wall at X=0, East wall at X=9
# South wall at Y=0, North wall at Y=6
# Floor at Z=0, Ceiling at Z=10

# ============================================================
# MATERIAL HELPERS
# ============================================================
def make_mat(name, color, roughness=0.5, metallic=0.0, alpha=1.0):
    """Create a Principled BSDF material."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    if isinstance(color, int):
        r = (color >> 16 & 0xFF) / 255
        g = (color >> 8 & 0xFF) / 255
        b = (color & 0xFF) / 255
    else:
        r, g, b = color
    bsdf.inputs["Base Color"].default_value = (r, g, b, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        mat.use_backface_culling = False
        # Blender 3.x
        try:
            mat.blend_method = 'BLEND'
        except:
            pass
        # Blender 4.x
        try:
            mat.surface_render_method = 'BLENDED'
        except:
            pass
    return mat

# Materials
mat_wall       = make_mat("Wall",        0xD4C9A8, roughness=0.7)
mat_wall_ext   = make_mat("Wall_Ext",    0xC8E6C8, roughness=0.7)  # light green exterior
mat_floor      = make_mat("Floor",       0x8B7D6B, roughness=0.8)
mat_floor_dark = make_mat("Floor_Dark",  0x7A6E5C, roughness=0.8)
mat_shower_fl  = make_mat("Shower_Floor",0x2A4A44, roughness=0.4)
mat_ceiling    = make_mat("Ceiling",     0xF5F0E8, roughness=0.6)
mat_wc         = make_mat("WC",          0xE8E8E8, roughness=0.2)
mat_urinal     = make_mat("Urinal",      0xE0E0E0, roughness=0.2)
mat_basin      = make_mat("Basin",       0xF0F0F0, roughness=0.1)
mat_counter    = make_mat("Counter",     0x6B5B4A, roughness=0.4)
mat_mirror     = make_mat("Mirror",      0xAABBCC, roughness=0.02, metallic=0.95)
mat_chrome     = make_mat("Chrome",      0xCCCCCC, roughness=0.1, metallic=0.95)
mat_glass      = make_mat("Glass",       0x88CCFF, roughness=0.05, alpha=0.2)
mat_door       = make_mat("Door",        0x8B6914, roughness=0.4)
mat_door_frame = make_mat("Door_Frame",  0x5A4A2A, roughness=0.5)
mat_geyser     = make_mat("Geyser",      0xF0883E, roughness=0.3)
mat_pipe_cold  = make_mat("Pipe_Cold",   0x4488CC, roughness=0.3, metallic=0.7)
mat_pipe_hot   = make_mat("Pipe_Hot",    0xCC4444, roughness=0.3, metallic=0.7)
mat_metal_gray = make_mat("Metal_Gray",  0x666666, roughness=0.3, metallic=0.8)
mat_exhaust    = make_mat("Exhaust",     0x888888, roughness=0.4, metallic=0.5)
mat_drain      = make_mat("Drain",       0x333333, roughness=0.3, metallic=0.8)

# ============================================================
# GEOMETRY HELPERS
# ============================================================
def add_box(name, size, loc, mat, parent=None):
    """Create a box mesh at given location with given material."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0]/2, size[1]/2, size[2]/2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    return obj

def add_cylinder(name, radius, depth, loc, mat, rot=(0,0,0)):
    """Create a cylinder mesh."""
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    return obj

def add_torus(name, major_r, minor_r, loc, mat, rot=(0,0,0)):
    """Create a torus mesh."""
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_r, minor_radius=minor_r,
        location=loc, rotation=rot
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    return obj

# ============================================================
# CREATE COLLECTION
# ============================================================
toilet_col = bpy.data.collections.new("Greeneye_Toilet")
bpy.context.scene.collection.children.link(toilet_col)
layer_col = bpy.context.view_layer.layer_collection.children[toilet_col.name]
bpy.context.view_layer.active_layer_collection = layer_col

# ============================================================
# FLOOR
# ============================================================
add_box("Floor", (ROOM_W, ROOM_D, 0.2), (ROOM_W/2, ROOM_D/2, -0.1), mat_floor)

# Floor tiles (checkerboard pattern)
for x in range(9):
    for y in range(6):
        m = mat_floor if (x + y) % 2 == 0 else mat_floor_dark
        add_box(f"Tile_{x}_{y}", (0.95, 0.95, 0.02), (x+0.5, y+0.5, 0.01), m)

# Shower floor tiles
for xi in range(6):
    for yi in range(5):
        x = 6 + xi * 0.5 + 0.25
        y = yi * 0.5 + 0.25
        if x < 9 and y < 2.5:
            add_box(f"ShowerTile_{xi}_{yi}", (0.45, 0.45, 0.025), (x, y, 0.02), mat_shower_fl)

# ============================================================
# WALLS
# ============================================================
# North wall (Y = ROOM_D = 6, full width)
add_box("Wall_North", (ROOM_W, WALL_T, ROOM_H), (ROOM_W/2, ROOM_D + WALL_T/2, ROOM_H/2), mat_wall)

# South wall (Y = 0, full width)
add_box("Wall_South", (ROOM_W, WALL_T, ROOM_H), (ROOM_W/2, -WALL_T/2, ROOM_H/2), mat_wall)

# East wall (X = ROOM_W = 9, full depth)
add_box("Wall_East", (WALL_T, ROOM_D, ROOM_H), (ROOM_W + WALL_T/2, ROOM_D/2, ROOM_H/2), mat_wall)

# West wall — split around door
# WC section: Y = 3 to 6 (North portion)
add_box("Wall_West_WC", (WALL_T, 3.0, ROOM_H), (-WALL_T/2, 4.5, ROOM_H/2), mat_wall)

# Above door: Y = 0.5 to 3.0 (2.5ft door), above 7ft
add_box("Wall_West_AboveDoor", (WALL_T, 2.5, 3.0), (-WALL_T/2, 1.75, 8.5), mat_wall)

# Below South gap: Y = 0 to 0.5
add_box("Wall_West_SouthGap", (WALL_T, 0.5, ROOM_H), (-WALL_T/2, 0.25, ROOM_H/2), mat_wall)

# Ceiling (optional — can comment out for visibility)
# add_box("Ceiling", (ROOM_W, ROOM_D, 0.15), (ROOM_W/2, ROOM_D/2, ROOM_H + 0.075), mat_ceiling)

# ============================================================
# DOOR — hinged on South jamb (Y=0.5), swings inward toward East
# ============================================================
# Door pivot empty at hinge point
door_pivot = bpy.data.objects.new("Door_Pivot", None)
toilet_col.objects.link(door_pivot)
door_pivot.location = (0, 0.5, 0)
door_pivot.empty_display_size = 0.3

# Door panel
door = add_box("Door", (0.15, 2.5, 7.0), (0.15, 1.75, 3.5), mat_door, parent=door_pivot)

# Rotate door ajar (~30° inward toward East = rotation around Z)
door_pivot.rotation_euler = (0, 0, 0.5)

# Door handle
add_cylinder("Door_Handle", 0.04, 0.15, (0.2, 2.85, 3.3), mat_chrome, rot=(math.pi/2, 0, 0))

# Door frame
add_box("Frame_Top", (0.3, 2.7, 0.2), (-WALL_T/2, 1.75, 7.1), mat_door_frame)
add_box("Frame_South", (0.3, 0.12, 7.2), (-WALL_T/2, 0.5, 3.5), mat_door_frame)
add_box("Frame_North", (0.3, 0.12, 7.2), (-WALL_T/2, 3.0, 3.5), mat_door_frame)

# ============================================================
# GLASS PARTITION — between WC (North) and Door (South) at Y=3
# 8ft height, extends ~3.5ft East from West wall
# ============================================================
glass_part = add_box("Glass_Partition", (3.5, 0.05, 8.0), (1.75, 3.0, 4.0), mat_glass)

# Metal frame rails
add_box("Glass_Rail_Bottom", (3.5, 0.1, 0.08), (1.75, 3.0, 0.04), mat_metal_gray)
add_box("Glass_Rail_Top", (3.5, 0.1, 0.08), (1.75, 3.0, 8.0), mat_metal_gray)
add_box("Glass_Rail_Left", (0.06, 0.1, 8.0), (0.03, 3.0, 4.0), mat_metal_gray)
add_box("Glass_Rail_Right", (0.06, 0.1, 8.0), (3.5, 3.0, 4.0), mat_metal_gray)

# ============================================================
# WC — West wall, North portion (Y=3 to 5.5), user faces East (+X)
# ============================================================
# Cistern (against West wall)
add_box("WC_Cistern", (0.8, 1.3, 1.2), (0.5, 4.5, 0.9), mat_wc)

# Flush button
add_cylinder("WC_Flush", 0.07, 0.05, (0.95, 4.5, 1.55), mat_chrome, rot=(0, math.pi/2, 0))

# Bowl
add_box("WC_Bowl", (1.3, 1.3, 0.9), (1.35, 4.5, 0.45), mat_wc)

# Seat (torus)
add_torus("WC_Seat", 0.45, 0.06, (1.4, 4.5, 0.95), mat_wc, rot=(0, 0, 0))

# Health faucet holder
add_cylinder("Health_Faucet", 0.03, 0.5, (2.1, 5.2, 1.2), mat_chrome)

# Toilet paper holder
add_cylinder("TP_Holder", 0.06, 0.03, (2.1, 3.9, 1.1), mat_chrome, rot=(math.pi/2, 0, 0))

# ============================================================
# URINAL — South wall (Y~0), center at X≈4.2
# ============================================================
# Urinal body
add_box("Urinal_Body", (1.2, 0.6, 1.8), (4.2, 0.35, 1.5), mat_urinal)

# Urinal bowl depression
add_box("Urinal_Bowl", (0.8, 0.15, 1.2), (4.2, 0.55, 1.4), mat_basin)

# Flush valve
add_cylinder("Urinal_Flush", 0.04, 0.3, (4.2, 0.2, 2.6), mat_chrome)

# Urinal drain
add_cylinder("Urinal_Drain", 0.05, 0.1, (4.2, 0.35, 0.15), mat_drain)

# ============================================================
# HANDWASH COUNTER — East wall (X≈9), NE area, user faces East
# Counter runs N-S along East wall
# ============================================================
# Counter slab
add_box("Counter_Slab", (1.2, 2.5, 0.12), (8.4, 4.75, 2.6), mat_counter)

# Counter back panel (against East wall)
add_box("Counter_Back", (0.1, 2.5, 2.5), (8.95, 4.75, 1.25), mat_counter)

# Basin
add_cylinder("Basin", 0.45, 0.3, (8.4, 4.75, 2.55), mat_basin)

# Faucet stem
add_cylinder("Faucet_Stem", 0.03, 0.6, (8.85, 4.75, 2.95), mat_chrome)

# Faucet spout (horizontal, toward West)
add_cylinder("Faucet_Spout", 0.025, 0.4, (8.65, 4.75, 3.2), mat_chrome, rot=(0, math.pi/2, 0))

# Mirror (on East wall above counter)
add_box("Mirror", (0.08, 1.8, 2.2), (8.96, 4.75, 4.5), mat_mirror)

# Mirror frame
add_box("Mirror_Frame", (0.05, 1.9, 2.3), (8.98, 4.75, 4.5), mat_metal_gray)

# ============================================================
# SHOWER ZONE — SE corner (X=6 to 9, Y=0 to ~2.5)
# ============================================================
# Shower tray (raised)
add_box("Shower_Tray", (3.0, 2.4, 0.1), (7.5, 1.2, 0.05), mat_shower_fl)

# Rain shower head
add_cylinder("Shower_Head", 0.35, 0.05, (7.5, 1.2, 8.0), mat_chrome)

# Shower arm (from East wall)
add_cylinder("Shower_Arm", 0.025, 1.2, (8.4, 1.2, 8.0), mat_chrome, rot=(0, math.pi/2, 0))

# Handheld shower holder (on East wall)
add_box("Handheld_Holder", (0.06, 0.06, 0.3), (8.95, 1.0, 4.5), mat_chrome)

# Shower floor drain
add_cylinder("Shower_Drain", 0.12, 0.02, (7.5, 1.0, 0.11), mat_drain)

# Shower glass partition (West edge of shower, at X=6)
# 8ft height
shower_glass = add_box("Shower_Glass", (0.05, 2.4, 8.0), (6.0, 1.2, 4.0), mat_glass)

# Shower glass frame rails
add_box("Shower_Glass_Rail_Bot", (0.1, 2.4, 0.08), (6.0, 1.2, 0.04), mat_metal_gray)
add_box("Shower_Glass_Rail_Top", (0.1, 2.4, 0.08), (6.0, 1.2, 8.0), mat_metal_gray)

# ============================================================
# GEYSER — East wall, above handwash
# ============================================================
add_box("Geyser", (0.5, 0.8, 1.2), (8.7, 4.75, 6.5), mat_geyser)

# Geyser label plate
add_box("Geyser_Label", (0.35, 0.6, 0.25), (8.7, 4.75, 6.5), mat_geyser)

# Cold inlet pipe
add_cylinder("Geyser_Pipe_Cold", 0.025, 2.5, (8.55, 4.55, 4.6), mat_pipe_cold)

# Hot outlet pipe
add_cylinder("Geyser_Pipe_Hot", 0.025, 2.5, (8.55, 4.95, 4.6), mat_pipe_hot)

# ============================================================
# EXHAUST FAN — West wall @7ft (above WC)
# ============================================================
add_box("Exhaust_Fan", (0.15, 0.8, 0.8), (0.0, 5.0, 7.5), mat_exhaust)

# Exhaust grille
for i in range(5):
    add_box(f"Exhaust_Grille_{i}", (0.02, 0.7, 0.05), (-0.05, 5.0, 7.2 + i * 0.15), mat_metal_gray)

# ============================================================
# HIGH LOUVRE — East wall @7ft
# ============================================================
add_box("Louvre_Frame", (0.15, 1.5, 1.2), (9.0, 3.5, 7.5), mat_exhaust)

# Louvre slats
for i in range(6):
    slat = add_box(f"Louvre_Slat_{i}", (0.12, 1.4, 0.03), (9.05, 3.5, 7.0 + i * 0.2), mat_metal_gray)
    slat.rotation_euler = (0, 0.3, 0)

# ============================================================
# FLOOR DRAINS
# ============================================================
add_cylinder("Floor_Drain_Main", 0.15, 0.02, (4.5, 2.5, 0.01), mat_drain)

# ============================================================
# LABELS (Text objects for reference — can be hidden for render)
# ============================================================
def add_text(name, text, loc, size=0.25, color=(0.25, 0.72, 0.31, 1)):
    """Add a 3D text label."""
    bpy.ops.object.text_add(location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.body = text
    obj.data.size = size
    obj.data.align_x = 'CENTER'
    # Create material for text
    tmat = bpy.data.materials.new(name=f"Text_{name}")
    tmat.use_nodes = True
    bsdf = tmat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = 0.5
    obj.data.materials.append(tmat)
    return obj

add_text("Label_WC",       "WC",           (1.3, 4.5, 3.5),  0.3, (0.25, 0.72, 0.31, 1))
add_text("Label_Urinal",   "URINAL",       (4.2, 0.6, 3.5),  0.25, (0.34, 0.65, 1.0, 1))
add_text("Label_Handwash", "HANDWASH",     (7.5, 4.75, 4.5), 0.2, (0.74, 0.55, 1.0, 1))
add_text("Label_Shower",   "SHOWER",       (7.5, 1.2, 5.0),  0.25, (0.22, 0.82, 0.75, 1))
add_text("Label_Geyser",   "GEYSER 15L",  (8.3, 4.75, 8.0), 0.2, (0.94, 0.53, 0.24, 1))
add_text("Label_Glass",    "GLASS 8ft",    (1.75, 3.0, 8.8), 0.2, (0.47, 0.75, 1.0, 1))
add_text("Label_Door",     "DOOR",         (1.0, 1.75, 5.0), 0.25, (0.83, 0.63, 0.19, 1))
add_text("Label_N",        "N",            (4.5, 6.5, 0.2),  0.4, (0.25, 0.72, 0.31, 1))
add_text("Label_S",        "S",            (4.5, -0.5, 0.2), 0.4, (0.5, 0.5, 0.5, 1))
add_text("Label_E",        "E",            (9.5, 3.0, 0.2),  0.4, (0.5, 0.5, 0.5, 1))
add_text("Label_W",        "W",            (-0.5, 3.0, 0.2), 0.4, (0.5, 0.5, 0.5, 1))

# ============================================================
# CAMERA
# ============================================================
bpy.ops.object.camera_add(
    location=(15, -8, 12),
    rotation=(math.radians(55), 0, math.radians(60))
)
cam = bpy.context.active_object
cam.name = "Camera_Perspective"
cam.data.lens = 28
bpy.context.scene.camera = cam

# Top-down camera
bpy.ops.object.camera_add(
    location=(ROOM_W/2, ROOM_D/2, 18),
    rotation=(0, 0, 0)
)
cam_top = bpy.context.active_object
cam_top.name = "Camera_TopDown"
cam_top.data.type = 'ORTHO'
cam_top.data.ortho_scale = 14

# Entry view camera
bpy.ops.object.camera_add(
    location=(-3, 1.5, 4),
    rotation=(math.radians(78), 0, math.radians(-15))
)
cam_entry = bpy.context.active_object
cam_entry.name = "Camera_Entry"
cam_entry.data.lens = 24

# ============================================================
# LIGHTING
# ============================================================
# Sun light
bpy.ops.object.light_add(type='SUN', location=(10, 10, 15))
sun = bpy.context.active_object
sun.name = "Sun"
sun.data.energy = 3.0
sun.data.color = (1.0, 0.95, 0.85)
sun.rotation_euler = (math.radians(45), math.radians(15), math.radians(30))

# Interior fill light (above room center)
bpy.ops.object.light_add(type='AREA', location=(4.5, 3.0, 9.5))
fill = bpy.context.active_object
fill.name = "Fill_Light"
fill.data.energy = 200
fill.data.size = 4.0
fill.data.color = (1.0, 0.98, 0.9)

# WC zone accent light
bpy.ops.object.light_add(type='POINT', location=(1.5, 4.5, 8.5))
wc_light = bpy.context.active_object
wc_light.name = "WC_Light"
wc_light.data.energy = 50
wc_light.data.color = (1.0, 1.0, 0.9)

# Shower zone accent
bpy.ops.object.light_add(type='POINT', location=(7.5, 1.2, 8.5))
sh_light = bpy.context.active_object
sh_light.name = "Shower_Light"
sh_light.data.energy = 40
sh_light.data.color = (0.9, 0.95, 1.0)

# ============================================================
# RENDER SETTINGS
# ============================================================
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 128
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = True

# World background
world = bpy.data.worlds.new("Toilet_World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (0.02, 0.02, 0.04, 1.0)
bg.inputs["Strength"].default_value = 0.3

# ============================================================
# FINAL — select all, set origin, frame view
# ============================================================
bpy.ops.object.select_all(action='DESELECT')
print("\n" + "=" * 60)
print("GREENEYE TOILET MODEL — LOADED SUCCESSFULLY")
print("=" * 60)
print(f"Room: {ROOM_W}ft × {ROOM_D}ft × {ROOM_H}ft")
print(f"Fixtures: WC (W wall), Urinal (S wall), Handwash (E wall)")
print(f"          Shower (SE), Geyser (E wall), Glass partition (8ft)")
print(f"Cameras: Perspective, TopDown, Entry")
print(f"Render: Cycles, 1920×1080, 128 samples")
print("=" * 60)
print("Press Numpad 0 for camera view, F12 to render")
print("Switch cameras in Properties > Scene > Camera dropdown")
print("=" * 60 + "\n")
