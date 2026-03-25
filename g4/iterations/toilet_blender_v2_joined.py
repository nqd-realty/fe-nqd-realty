"""
GREENEYE NURSERY — COMMON TOILET 3D MODEL (v2 — Joined Objects)
================================================================
All related parts are joined into single objects:
  Room_Walls, Floor, WC, Urinal, Handwash, Shower, Geyser,
  Glass_Partition, Door, Ventilation, Labels

HOW TO USE:
1. Open Blender → Scripting workspace
2. New text block → paste this → Run Script (Alt+P)
3. Press Z → Material Preview (or Rendered)
4. Numpad 0 for camera view, F12 to render
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix

# ============================================================
# CLEANUP
# ============================================================
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in bpy.data.meshes:
    if block.users == 0:
        bpy.data.meshes.remove(block)
for block in bpy.data.materials:
    if block.users == 0:
        bpy.data.materials.remove(block)

# ============================================================
# CONSTANTS
# ============================================================
ROOM_W = 9.0   # E-W (X)
ROOM_D = 6.0   # N-S (Y) — South=0, North=6
ROOM_H = 10.0  # Z
WALL_T = 0.375

# ============================================================
# MATERIALS
# ============================================================
def make_mat(name, hex_color, roughness=0.5, metallic=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    r = (hex_color >> 16 & 0xFF) / 255
    g = (hex_color >> 8 & 0xFF) / 255
    b = (hex_color & 0xFF) / 255
    bsdf.inputs["Base Color"].default_value = (r, g, b, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        mat.use_backface_culling = False
        try:
            mat.blend_method = 'BLEND'
        except:
            pass
        try:
            mat.surface_render_method = 'BLENDED'
        except:
            pass
    return mat

mats = {
    'wall':       make_mat("Wall",        0xD4C9A8, 0.7),
    'floor':      make_mat("Floor",       0x8B7D6B, 0.8),
    'floor_alt':  make_mat("Floor_Alt",   0x7A6E5C, 0.8),
    'shower_fl':  make_mat("Shower_Fl",   0x2A4A44, 0.4),
    'wc':         make_mat("WC",          0xE8E8E8, 0.2),
    'urinal':     make_mat("Urinal",      0xE0E0E0, 0.2),
    'basin':      make_mat("Basin",       0xF0F0F0, 0.1),
    'counter':    make_mat("Counter",     0x6B5B4A, 0.4),
    'mirror':     make_mat("Mirror",      0xAABBCC, 0.02, 0.95),
    'chrome':     make_mat("Chrome",      0xCCCCCC, 0.1, 0.95),
    'glass':      make_mat("Glass",       0x88CCFF, 0.05, 0.0, 0.2),
    'door':       make_mat("Door",        0x8B6914, 0.4),
    'frame':      make_mat("Frame",       0x5A4A2A, 0.5),
    'geyser':     make_mat("Geyser",      0xF0883E, 0.3),
    'pipe_cold':  make_mat("Pipe_Cold",   0x4488CC, 0.3, 0.7),
    'pipe_hot':   make_mat("Pipe_Hot",    0xCC4444, 0.3, 0.7),
    'metal':      make_mat("Metal",       0x666666, 0.3, 0.8),
    'exhaust':    make_mat("Exhaust",     0x888888, 0.4, 0.5),
    'drain':      make_mat("Drain",       0x333333, 0.3, 0.8),
}

# ============================================================
# COLLECTION
# ============================================================
col = bpy.data.collections.new("Greeneye_Toilet")
bpy.context.scene.collection.children.link(col)
layer_col = bpy.context.view_layer.layer_collection.children[col.name]
bpy.context.view_layer.active_layer_collection = layer_col

# ============================================================
# BMESH BUILDER — builds a single mesh from multiple box/cylinder specs
# ============================================================
class MeshBuilder:
    """Accumulates geometry into a single mesh object with multiple materials."""

    def __init__(self, name):
        self.name = name
        self.mesh = bpy.data.meshes.new(name)
        self.obj = bpy.data.objects.new(name, self.mesh)
        col.objects.link(self.obj)
        self.bm = bmesh.new()
        self.mat_map = {}  # mat_name -> slot index

    def _get_mat_index(self, mat):
        mat_name = mat.name
        if mat_name not in self.mat_map:
            self.obj.data.materials.append(mat)
            self.mat_map[mat_name] = len(self.mat_map)
        return self.mat_map[mat_name]

    def add_box(self, size, loc, mat):
        """Add a box with given size (x,y,z), location, and material."""
        mat_idx = self._get_mat_index(mat)
        sx, sy, sz = size[0]/2, size[1]/2, size[2]/2
        verts = []
        for dx in (-sx, sx):
            for dy in (-sy, sy):
                for dz in (-sz, sz):
                    verts.append(self.bm.verts.new((loc[0]+dx, loc[1]+dy, loc[2]+dz)))
        self.bm.verts.ensure_lookup_table()

        # 6 faces of a box (vertex indices within this box: 0-7)
        face_indices = [
            (0,1,3,2), (4,6,7,5),  # -X, +X
            (0,4,5,1), (2,3,7,6),  # -Y, +Y
            (0,2,6,4), (1,5,7,3),  # -Z, +Z
        ]
        for fi in face_indices:
            face = self.bm.faces.new([verts[i] for i in fi])
            face.material_index = mat_idx

    def add_cylinder(self, radius, depth, loc, mat, segments=16, rot_axis=None):
        """Add a cylinder. Default is vertical (Z-up). rot_axis='X' or 'Y' to rotate."""
        mat_idx = self._get_mat_index(mat)

        # Build cylinder verts
        half = depth / 2
        top_verts = []
        bot_verts = []
        for i in range(segments):
            angle = 2 * math.pi * i / segments
            x = radius * math.cos(angle)
            y = radius * math.sin(angle)

            if rot_axis == 'X':
                # Rotate 90° around X: cylinder along Y axis
                top_verts.append(self.bm.verts.new((loc[0]+x, loc[1]+half, loc[2]+y)))
                bot_verts.append(self.bm.verts.new((loc[0]+x, loc[1]-half, loc[2]+y)))
            elif rot_axis == 'Y':
                # Rotate 90° around Y: cylinder along X axis
                top_verts.append(self.bm.verts.new((loc[0]+half, loc[1]+x, loc[2]+y)))
                bot_verts.append(self.bm.verts.new((loc[0]-half, loc[1]+x, loc[2]+y)))
            else:
                # Default: vertical (Z axis)
                top_verts.append(self.bm.verts.new((loc[0]+x, loc[1]+y, loc[2]+half)))
                bot_verts.append(self.bm.verts.new((loc[0]+x, loc[1]+y, loc[2]-half)))

        self.bm.verts.ensure_lookup_table()

        # Side faces
        for i in range(segments):
            j = (i + 1) % segments
            face = self.bm.faces.new([bot_verts[i], bot_verts[j], top_verts[j], top_verts[i]])
            face.material_index = mat_idx

        # Cap faces
        top_face = self.bm.faces.new(top_verts)
        top_face.material_index = mat_idx
        bot_face = self.bm.faces.new(list(reversed(bot_verts)))
        bot_face.material_index = mat_idx

    def finish(self):
        """Write bmesh to mesh and free."""
        self.bm.to_mesh(self.mesh)
        self.bm.free()
        self.mesh.update()
        return self.obj


# ============================================================
# 1. FLOOR (single joined object)
# ============================================================
floor = MeshBuilder("Floor")
floor.add_box((ROOM_W, ROOM_D, 0.2), (ROOM_W/2, ROOM_D/2, -0.1), mats['floor'])

# Checker tiles
for x in range(9):
    for y in range(6):
        m = mats['floor'] if (x+y)%2==0 else mats['floor_alt']
        floor.add_box((0.95, 0.95, 0.02), (x+0.5, y+0.5, 0.01), m)

# Shower floor tiles
for xi in range(6):
    for yi in range(5):
        px = 6 + xi*0.5 + 0.25
        py = yi*0.5 + 0.25
        if px < 9 and py < 2.5:
            floor.add_box((0.45, 0.45, 0.025), (px, py, 0.02), mats['shower_fl'])

floor.finish()

# ============================================================
# 2. WALLS (single joined object)
# ============================================================
walls = MeshBuilder("Room_Walls")

# North
walls.add_box((ROOM_W, WALL_T, ROOM_H), (ROOM_W/2, ROOM_D+WALL_T/2, ROOM_H/2), mats['wall'])
# South
walls.add_box((ROOM_W, WALL_T, ROOM_H), (ROOM_W/2, -WALL_T/2, ROOM_H/2), mats['wall'])
# East
walls.add_box((WALL_T, ROOM_D, ROOM_H), (ROOM_W+WALL_T/2, ROOM_D/2, ROOM_H/2), mats['wall'])
# West — WC section (N)
walls.add_box((WALL_T, 3.0, ROOM_H), (-WALL_T/2, 4.5, ROOM_H/2), mats['wall'])
# West — above door
walls.add_box((WALL_T, 2.5, 3.0), (-WALL_T/2, 1.75, 8.5), mats['wall'])
# West — S gap
walls.add_box((WALL_T, 0.5, ROOM_H), (-WALL_T/2, 0.25, ROOM_H/2), mats['wall'])

walls.finish()

# ============================================================
# 3. DOOR (joined: panel + handle + frame) — hinged South jamb
# ============================================================
# Door pivot empty
door_pivot = bpy.data.objects.new("Door_Pivot", None)
col.objects.link(door_pivot)
door_pivot.location = (0, 0.5, 0)
door_pivot.empty_display_size = 0.2
door_pivot.rotation_euler = (0, 0, 0.5)  # ajar toward East

door = MeshBuilder("Door")
# Panel (offset from pivot: extends North from hinge)
door.add_box((0.15, 2.5, 7.0), (0.15, 1.25, 3.5), mats['door'])
# Handle
door.add_cylinder(0.04, 0.15, (0.2, 2.35, 3.3), mats['chrome'], rot_axis='X')
obj_door = door.finish()
obj_door.parent = door_pivot

# Door frame (separate, static)
dframe = MeshBuilder("Door_Frame")
dframe.add_box((0.3, 2.7, 0.2), (-WALL_T/2, 1.75, 7.1), mats['frame'])
dframe.add_box((0.3, 0.12, 7.2), (-WALL_T/2, 0.5, 3.5), mats['frame'])
dframe.add_box((0.3, 0.12, 7.2), (-WALL_T/2, 3.0, 3.5), mats['frame'])
dframe.finish()

# ============================================================
# 4. GLASS PARTITION (joined: glass + rails) — 8ft height
# ============================================================
gpart = MeshBuilder("Glass_Partition")
gpart.add_box((3.5, 0.05, 8.0), (1.75, 3.0, 4.0), mats['glass'])
# Metal rails
gpart.add_box((3.5, 0.1, 0.08), (1.75, 3.0, 0.04), mats['metal'])
gpart.add_box((3.5, 0.1, 0.08), (1.75, 3.0, 8.0), mats['metal'])
gpart.add_box((0.06, 0.1, 8.0), (0.03, 3.0, 4.0), mats['metal'])
gpart.add_box((0.06, 0.1, 8.0), (3.5, 3.0, 4.0), mats['metal'])
gpart.finish()

# ============================================================
# 5. WC (joined: cistern + bowl + seat + flush + HF + TP)
# ============================================================
wc = MeshBuilder("WC")
# Cistern
wc.add_box((0.8, 1.3, 1.2), (0.5, 4.5, 0.9), mats['wc'])
# Flush button
wc.add_cylinder(0.07, 0.05, (0.95, 4.5, 1.55), mats['chrome'], rot_axis='Y')
# Bowl
wc.add_box((1.3, 1.3, 0.9), (1.35, 4.5, 0.45), mats['wc'])
# Seat ring (approximated as a flat cylinder)
wc.add_cylinder(0.45, 0.06, (1.4, 4.5, 0.95), mats['wc'])
# Health faucet
wc.add_cylinder(0.03, 0.5, (2.1, 5.2, 1.2), mats['chrome'])
# TP holder
wc.add_cylinder(0.06, 0.03, (2.1, 3.9, 1.1), mats['chrome'], rot_axis='X')
wc.finish()

# ============================================================
# 6. URINAL (joined: body + bowl + flush + drain)
# ============================================================
uri = MeshBuilder("Urinal")
uri.add_box((1.2, 0.6, 1.8), (4.2, 0.35, 1.5), mats['urinal'])
uri.add_box((0.8, 0.15, 1.2), (4.2, 0.55, 1.4), mats['basin'])
uri.add_cylinder(0.04, 0.3, (4.2, 0.2, 2.6), mats['chrome'])
uri.add_cylinder(0.05, 0.1, (4.2, 0.35, 0.15), mats['drain'])
uri.finish()

# ============================================================
# 7. HANDWASH (joined: counter + back + basin + faucet + mirror)
# On East wall, user faces East
# ============================================================
hw = MeshBuilder("Handwash")
# Counter slab (against E wall, runs N-S)
hw.add_box((1.2, 2.5, 0.12), (8.4, 4.75, 2.6), mats['counter'])
# Back panel
hw.add_box((0.1, 2.5, 2.5), (8.95, 4.75, 1.25), mats['counter'])
# Basin
hw.add_cylinder(0.45, 0.3, (8.4, 4.75, 2.55), mats['basin'])
# Faucet stem
hw.add_cylinder(0.03, 0.6, (8.85, 4.75, 2.95), mats['chrome'])
# Faucet spout (horizontal toward West)
hw.add_cylinder(0.025, 0.4, (8.65, 4.75, 3.2), mats['chrome'], rot_axis='Y')
# Mirror
hw.add_box((0.08, 1.8, 2.2), (8.96, 4.75, 4.5), mats['mirror'])
# Mirror frame
hw.add_box((0.05, 1.9, 2.3), (8.98, 4.75, 4.5), mats['metal'])
hw.finish()

# ============================================================
# 8. SHOWER (joined: tray + head + arm + holder + drain + glass)
# ============================================================
shower = MeshBuilder("Shower")
# Tray
shower.add_box((3.0, 2.4, 0.1), (7.5, 1.2, 0.05), mats['shower_fl'])
# Rain head
shower.add_cylinder(0.35, 0.05, (7.5, 1.2, 8.0), mats['chrome'])
# Arm
shower.add_cylinder(0.025, 1.2, (8.4, 1.2, 8.0), mats['chrome'], rot_axis='Y')
# Handheld holder
shower.add_box((0.06, 0.06, 0.3), (8.95, 1.0, 4.5), mats['chrome'])
# Drain
shower.add_cylinder(0.12, 0.02, (7.5, 1.0, 0.11), mats['drain'])
# Glass partition (8ft)
shower.add_box((0.05, 2.4, 8.0), (6.0, 1.2, 4.0), mats['glass'])
# Glass rails
shower.add_box((0.1, 2.4, 0.08), (6.0, 1.2, 0.04), mats['metal'])
shower.add_box((0.1, 2.4, 0.08), (6.0, 1.2, 8.0), mats['metal'])
shower.finish()

# ============================================================
# 9. GEYSER (joined: body + pipes)
# ============================================================
gey = MeshBuilder("Geyser")
gey.add_box((0.5, 0.8, 1.2), (8.7, 4.75, 6.5), mats['geyser'])
gey.add_box((0.35, 0.6, 0.25), (8.7, 4.75, 6.5), mats['geyser'])
# Cold pipe
gey.add_cylinder(0.025, 2.5, (8.55, 4.55, 4.6), mats['pipe_cold'])
# Hot pipe
gey.add_cylinder(0.025, 2.5, (8.55, 4.95, 4.6), mats['pipe_hot'])
gey.finish()

# ============================================================
# 10. VENTILATION (joined: exhaust + louvre)
# ============================================================
vent = MeshBuilder("Ventilation")
# Exhaust fan (West wall)
vent.add_box((0.15, 0.8, 0.8), (0.0, 5.0, 7.5), mats['exhaust'])
for i in range(5):
    vent.add_box((0.02, 0.7, 0.05), (-0.05, 5.0, 7.2+i*0.15), mats['metal'])
# High louvre (East wall)
vent.add_box((0.15, 1.5, 1.2), (9.0, 3.5, 7.5), mats['exhaust'])
vent.finish()

# ============================================================
# 11. FLOOR DRAINS (joined)
# ============================================================
drains = MeshBuilder("Floor_Drains")
drains.add_cylinder(0.15, 0.02, (4.5, 2.5, 0.01), mats['drain'])
drains.finish()

# ============================================================
# CAMERAS
# ============================================================
# Perspective
bpy.ops.object.camera_add(
    location=(15, -8, 12),
    rotation=(math.radians(55), 0, math.radians(60))
)
cam = bpy.context.active_object
cam.name = "Camera_Perspective"
cam.data.lens = 28
bpy.context.scene.camera = cam

# Top-down
bpy.ops.object.camera_add(
    location=(ROOM_W/2, ROOM_D/2, 18),
    rotation=(0, 0, 0)
)
cam_top = bpy.context.active_object
cam_top.name = "Camera_TopDown"
cam_top.data.type = 'ORTHO'
cam_top.data.ortho_scale = 14

# Entry view
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
bpy.ops.object.light_add(type='SUN', location=(10, 10, 15))
sun = bpy.context.active_object
sun.name = "Sun"
sun.data.energy = 3.0
sun.data.color = (1.0, 0.95, 0.85)
sun.rotation_euler = (math.radians(45), math.radians(15), math.radians(30))

bpy.ops.object.light_add(type='AREA', location=(4.5, 3.0, 9.5))
fill = bpy.context.active_object
fill.name = "Fill_Light"
fill.data.energy = 200
fill.data.size = 4.0

bpy.ops.object.light_add(type='POINT', location=(1.5, 4.5, 8.5))
wc_light = bpy.context.active_object
wc_light.name = "WC_Light"
wc_light.data.energy = 50

bpy.ops.object.light_add(type='POINT', location=(7.5, 1.2, 8.5))
sh_light = bpy.context.active_object
sh_light.name = "Shower_Light"
sh_light.data.energy = 40

# ============================================================
# RENDER SETTINGS
# ============================================================
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 128
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = True

world = bpy.data.worlds.new("Toilet_World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (0.02, 0.02, 0.04, 1.0)
bg.inputs["Strength"].default_value = 0.3

# ============================================================
# DONE
# ============================================================
bpy.ops.object.select_all(action='DESELECT')
print("\n" + "="*60)
print("GREENEYE TOILET — LOADED (Joined Objects)")
print("="*60)
print("Outliner objects:")
print("  Floor, Room_Walls, Door + Door_Pivot, Door_Frame")
print("  Glass_Partition, WC, Urinal, Handwash, Shower")
print("  Geyser, Ventilation, Floor_Drains")
print("  3 Cameras, 4 Lights")
print("="*60)
print("Press Z → Material Preview to see colors")
print("Numpad 0 → Camera view | F12 → Render")
print("="*60 + "\n")
