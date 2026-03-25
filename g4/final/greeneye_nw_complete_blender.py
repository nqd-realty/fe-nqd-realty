"""
GREENEYE NURSERY — COMPLETE NW CORNER 3D MODEL
================================================
Toilet v4 (9×6ft) + Caretaker Room (9×9ft) + 5ft Pathway
+ Car Parking (14×15ft) + South Cantilever + Outdoor Counter

Coordinate system:
  X = East-West (East = +X, 0-9ft buildable, -5 to 0 pathway)
  Y = North-South (North = +Y)
  Z = Height (0 = ground, 10ft max)

Layout (Y axis, South to North):
  Y=0  to Y=5   : South cantilever (overhang)
  Y=5  to Y=14  : Caretaker Room (9ft)
  Y=14 to Y=20  : Common Toilet (6ft)
  Y=20 to Y=35  : Car Parking (15ft)
  Y=35          : North boundary (adjacent plot)

HOW TO USE:
1. Open Blender → Scripting workspace
2. New text block → paste → Run Script (Alt+P)
3. Press Z → Material Preview
4. Numpad 0 for camera, F12 to render
"""

import bpy, bmesh, math
from mathutils import Vector

# ============================================================
# CLEANUP
# ============================================================
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for b in bpy.data.meshes:
    if b.users == 0: bpy.data.meshes.remove(b)
for b in bpy.data.materials:
    if b.users == 0: bpy.data.materials.remove(b)

# ============================================================
# CONSTANTS
# ============================================================
WALL_T = 0.375
ROOM_H = 10.0
# Y coordinates
CANT_S = 0.0      # Cantilever south edge
ROOM_S = 5.0      # Room south wall
ROOM_N = 14.0     # Room north wall = Toilet south wall (dividing)
TOIL_N = 20.0     # Toilet north wall = Parking south edge
PARK_N = 35.0     # Parking north wall (boundary)
# X coordinates
PATH_W = -5.0     # Pathway west edge (road boundary)
BUILD_W = 0.0     # Buildable west edge
BUILD_E = 9.0     # Buildable east edge
PARK_E = 9.0      # Parking extends to same E

# ============================================================
# MATERIALS
# ============================================================
def mat(name, hx, rough=0.5, metal=0.0, alpha=1.0):
    m = bpy.data.materials.new(name=name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = ((hx>>16&0xFF)/255, (hx>>8&0xFF)/255, (hx&0xFF)/255, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
        try: m.blend_method = 'BLEND'
        except: pass
        try: m.surface_render_method = 'BLENDED'
        except: pass
    return m

M = {
    'wall':      mat("Wall",       0xD4C9A8, 0.7),
    'wall_ext':  mat("Wall_Ext",   0xC8E6C8, 0.7),
    'floor':     mat("Floor",      0x8B7D6B, 0.8),
    'floor_alt': mat("Floor_Alt",  0x7A6E5C, 0.8),
    'shower_fl': mat("Shower_Fl",  0x2A4A44, 0.4),
    'path_fl':   mat("Path_Floor", 0x9E9484, 0.9),
    'park_fl':   mat("Park_Floor", 0x666666, 0.8),
    'wc':        mat("WC",         0xE8E8E8, 0.2),
    'urinal':    mat("Urinal",     0xE0E0E0, 0.2),
    'basin':     mat("Basin",      0xF0F0F0, 0.1),
    'counter':   mat("Counter",    0x6B5B4A, 0.4),
    'counter_r': mat("Counter_Rm", 0x8B7B5A, 0.4),
    'mirror':    mat("Mirror",     0xAABBCC, 0.02, 0.95),
    'chrome':    mat("Chrome",     0xCCCCCC, 0.1, 0.95),
    'glass':     mat("Glass",      0x88CCFF, 0.05, 0.0, 0.2),
    'door':      mat("Door",       0x8B6914, 0.4),
    'frame':     mat("Frame",      0x5A4A2A, 0.5),
    'geyser':    mat("Geyser",     0xF0883E, 0.3),
    'pipe_c':    mat("Pipe_Cold",  0x4488CC, 0.3, 0.7),
    'pipe_h':    mat("Pipe_Hot",   0xCC4444, 0.3, 0.7),
    'metal':     mat("Metal",      0x666666, 0.3, 0.8),
    'exhaust':   mat("Exhaust",    0x888888, 0.4, 0.5),
    'drain':     mat("Drain",      0x333333, 0.3, 0.8),
    'storage':   mat("Storage",    0x7EA050, 0.5),
    'bed':       mat("Bed",        0xA080C0, 0.6),
    'pillow':    mat("Pillow",     0xC0B0D8, 0.7),
    'induction': mat("Induction",  0xE85D30, 0.3),
    'fridge':    mat("Fridge",     0xD0D8E0, 0.3),
    'louver':    mat("Louver",     0x39D2C0, 0.4),
    'outdoor':   mat("Outdoor_C",  0xC9A84C, 0.5),
    'shutter':   mat("Shutter",    0x8B8B8B, 0.3, 0.6),
    'concrete':  mat("Concrete",   0xB0A898, 0.8),
    'boundary':  mat("Boundary",   0x6B6B6B, 0.8),
}

# ============================================================
# COLLECTION
# ============================================================
col = bpy.data.collections.new("Greeneye_NW_Corner")
bpy.context.scene.collection.children.link(col)
lc = bpy.context.view_layer.layer_collection.children[col.name]
bpy.context.view_layer.active_layer_collection = lc

# ============================================================
# MESHBUILDER
# ============================================================
class MB:
    def __init__(s, name):
        s.mesh = bpy.data.meshes.new(name)
        s.obj = bpy.data.objects.new(name, s.mesh)
        col.objects.link(s.obj)
        s.bm = bmesh.new()
        s.mm = {}
    def _mi(s, m):
        if m.name not in s.mm:
            s.obj.data.materials.append(m)
            s.mm[m.name] = len(s.mm)
        return s.mm[m.name]
    def box(s, sz, loc, m):
        mi = s._mi(m)
        sx,sy,sz2 = sz[0]/2, sz[1]/2, sz[2]/2
        v = [s.bm.verts.new((loc[0]+dx, loc[1]+dy, loc[2]+dz))
             for dx in (-sx,sx) for dy in (-sy,sy) for dz in (-sz2,sz2)]
        s.bm.verts.ensure_lookup_table()
        for fi in [(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)]:
            f = s.bm.faces.new([v[i] for i in fi])
            f.material_index = mi
    def cyl(s, r, d, loc, m, seg=16, ax=None):
        mi = s._mi(m)
        h = d/2
        tv, bv = [], []
        for i in range(seg):
            a = 2*math.pi*i/seg
            x, y = r*math.cos(a), r*math.sin(a)
            if ax=='X':
                tv.append(s.bm.verts.new((loc[0]+x,loc[1]+h,loc[2]+y)))
                bv.append(s.bm.verts.new((loc[0]+x,loc[1]-h,loc[2]+y)))
            elif ax=='Y':
                tv.append(s.bm.verts.new((loc[0]+h,loc[1]+x,loc[2]+y)))
                bv.append(s.bm.verts.new((loc[0]-h,loc[1]+x,loc[2]+y)))
            else:
                tv.append(s.bm.verts.new((loc[0]+x,loc[1]+y,loc[2]+h)))
                bv.append(s.bm.verts.new((loc[0]+x,loc[1]+y,loc[2]-h)))
        s.bm.verts.ensure_lookup_table()
        for i in range(seg):
            j=(i+1)%seg
            f=s.bm.faces.new([bv[i],bv[j],tv[j],tv[i]]); f.material_index=mi
        f=s.bm.faces.new(tv); f.material_index=mi
        f=s.bm.faces.new(list(reversed(bv))); f.material_index=mi
    def done(s):
        s.bm.to_mesh(s.mesh); s.bm.free(); s.mesh.update()
        return s.obj

# ============================================================
# 1. GROUND / FLOORS
# ============================================================
fl = MB("Floors")
# Pathway floor
fl.box((5, 15, 0.15), (-2.5, 12.5, -0.075), M['path_fl'])
# Toilet floor
fl.box((9, 6, 0.15), (4.5, 17, -0.075), M['floor'])
# Room floor
fl.box((9, 9, 0.15), (4.5, 9.5, -0.075), M['floor_alt'])
# Parking floor
fl.box((14, 15, 0.15), (2, 27.5, -0.075), M['park_fl'])
# Cantilever floor (outdoor)
fl.box((9, 5, 0.1), (4.5, 2.5, -0.05), M['path_fl'])
fl.done()

# ============================================================
# 2. WALLS — All structure walls
# ============================================================
w = MB("Walls")
# North boundary wall (Y=35, full 14ft wide)
w.box((14, WALL_T, ROOM_H), (2, PARK_N+WALL_T/2, ROOM_H/2), M['boundary'])
# East wall (X=9, from room S to toilet N = Y=5 to Y=20)
w.box((WALL_T, 15, ROOM_H), (BUILD_E+WALL_T/2, 12.5, ROOM_H/2), M['wall'])
# Dividing wall between toilet and room (Y=14)
w.box((9, WALL_T, ROOM_H), (4.5, ROOM_N, ROOM_H/2), M['wall'])
# South wall of room / structure (Y=5)
w.box((9, WALL_T, ROOM_H), (4.5, ROOM_S-WALL_T/2, ROOM_H/2), M['wall'])

# -- TOILET West wall (split around door) --
# WC section (Y=17 to Y=20, N portion)
w.box((WALL_T, 3, ROOM_H), (-WALL_T/2, 18.5, ROOM_H/2), M['wall'])
# Above door (Y=14.5 to Y=17)
w.box((WALL_T, 2.5, 3), (-WALL_T/2, 15.75, 8.5), M['wall'])
# S gap (Y=14 to Y=14.5)
w.box((WALL_T, 0.5, ROOM_H), (-WALL_T/2, 14.25, ROOM_H/2), M['wall'])

# -- ROOM West wall (full, Y=5 to Y=14) --
w.box((WALL_T, 9, ROOM_H), (-WALL_T/2, 9.5, ROOM_H/2), M['wall'])

# -- ROOM East wall (split: door NE 3ft + wall below) --
# Solid portion below door (Y=5 to Y=11)
# (louver window area — we keep it as wall, louver is decorative)
# Above door (Y=14 down 3ft to Y=11 is door, below Y=11 is louver/wall)
# Actually: door at NE = Y=11 to Y=14, louver Y=5 to Y=11
# East wall for room is shared with toilet east wall above — already drawn
# We just need the door opening — handled by door object

# Parking walls
# West boundary for parking (X=-5 to X=0 pathway, X=0 is building)
w.box((WALL_T, 15, ROOM_H), (-5-WALL_T/2, 27.5, ROOM_H/2), M['boundary'])
w.done()

# ============================================================
# 3. ROOF / CANTILEVER SLAB
# ============================================================
rf = MB("Roof_Slab")
# Main roof slab over toilet + room
rf.box((9.5, 15.5, 0.5), (4.5, 12.25, ROOM_H+0.25), M['concrete'])
# South cantilever (5ft overhang, no columns)
rf.box((9.5, 5.5, 0.4), (4.5, 2.25, ROOM_H+0.2), M['concrete'])
# East 1ft overhang
rf.box((1, 15.5, 0.4), (9.75, 12.25, ROOM_H+0.2), M['concrete'])
rf.done()

# ============================================================
# 4. TOILET — Fixtures (Y=14 to Y=20)
# ============================================================
# WC (West wall, N portion of toilet)
wc = MB("Toilet_WC")
wc.box((0.8, 1.3, 1.2), (0.5, 18.5, 0.9), M['wc'])  # cistern
wc.cyl(0.07, 0.05, (0.95, 18.5, 1.55), M['chrome'], ax='Y')  # flush
wc.box((1.3, 1.3, 0.9), (1.35, 18.5, 0.45), M['wc'])  # bowl
wc.cyl(0.45, 0.06, (1.4, 18.5, 0.95), M['wc'])  # seat
wc.cyl(0.03, 0.5, (2.1, 19.2, 1.2), M['chrome'])  # health faucet
wc.done()

# Glass partition (between WC and door at Y=17)
gp = MB("Toilet_Glass_Partition")
gp.box((3.5, 0.05, 8.0), (1.75, 17, 4.0), M['glass'])
gp.box((3.5, 0.1, 0.08), (1.75, 17, 0.04), M['metal'])  # bottom rail
gp.box((3.5, 0.1, 0.08), (1.75, 17, 8.0), M['metal'])  # top rail
gp.done()

# Toilet door (hinged S jamb at Y=14.5, swings E)
td_pivot = bpy.data.objects.new("Toilet_Door_Pivot", None)
col.objects.link(td_pivot)
td_pivot.location = (0, 14.5, 0)
td_pivot.rotation_euler = (0, 0, -0.5)  # ajar
td = MB("Toilet_Door")
td.box((0.15, 2.5, 7.0), (0.15, 1.25, 3.5), M['door'])
td.cyl(0.04, 0.15, (0.2, 2.35, 3.3), M['chrome'], ax='X')
obj_td = td.done()
obj_td.parent = td_pivot

# Urinal (S wall of toilet, center)
ur = MB("Toilet_Urinal")
ur.box((1.2, 0.6, 1.8), (4.2, 14.35, 1.5), M['urinal'])
ur.box((0.8, 0.15, 1.2), (4.2, 14.55, 1.4), M['basin'])
ur.cyl(0.04, 0.3, (4.2, 14.2, 2.6), M['chrome'])
ur.done()

# Handwash (E wall, faces East)
hw = MB("Toilet_Handwash")
hw.box((1.2, 2.5, 0.12), (8.4, 18.75, 2.6), M['counter'])
hw.box((0.1, 2.5, 2.5), (8.95, 18.75, 1.25), M['counter'])
hw.cyl(0.45, 0.3, (8.4, 18.75, 2.55), M['basin'])
hw.cyl(0.03, 0.6, (8.85, 18.75, 2.95), M['chrome'])
hw.box((0.08, 1.8, 2.2), (8.96, 18.75, 4.5), M['mirror'])
hw.done()

# Shower (SE corner)
sh = MB("Toilet_Shower")
sh.box((3.0, 2.4, 0.1), (7.5, 15.2, 0.05), M['shower_fl'])
sh.cyl(0.35, 0.05, (7.5, 15.2, 8.0), M['chrome'])  # rain head
sh.cyl(0.025, 1.2, (8.4, 15.2, 8.0), M['chrome'], ax='Y')  # arm
sh.box((0.05, 2.4, 8.0), (6.0, 15.2, 4.0), M['glass'])  # glass partition
sh.box((0.1, 2.4, 0.08), (6.0, 15.2, 0.04), M['metal'])
sh.box((0.1, 2.4, 0.08), (6.0, 15.2, 8.0), M['metal'])
sh.cyl(0.12, 0.02, (7.5, 15.0, 0.11), M['drain'])
sh.done()

# Geyser (E wall above handwash)
gy = MB("Toilet_Geyser")
gy.box((0.5, 0.8, 1.2), (8.7, 18.75, 6.5), M['geyser'])
gy.cyl(0.025, 2.5, (8.55, 18.55, 4.6), M['pipe_c'])
gy.cyl(0.025, 2.5, (8.55, 18.95, 4.6), M['pipe_h'])
gy.done()

# Toilet ventilation
tv = MB("Toilet_Ventilation")
tv.box((0.15, 0.8, 0.8), (0, 19, 7.5), M['exhaust'])  # exhaust W
tv.box((0.15, 1.5, 1.2), (9, 17.5, 7.5), M['exhaust'])  # louvre E
tv.done()

# ============================================================
# 5. CARETAKER ROOM — Fixtures (Y=5 to Y=14)
# ============================================================

# L-Counter (NW corner)
# N arm: 6.3ft along N wall (Y=14), 1ft deep, 2.5ft height
# W arm: 3.4ft along W wall (X=0), 1.5ft deep
lc_obj = MB("Room_L_Counter")
# N arm
lc_obj.box((6.3, 1.0, 0.12), (3.15, 13.5, 2.56), M['counter_r'])  # slab
lc_obj.box((6.3, 0.1, 2.5), (3.15, 14-0.05, 1.25), M['counter_r'])  # back
# W arm
lc_obj.box((1.5, 3.4, 0.12), (0.75, 12.3, 2.56), M['counter_r'])
lc_obj.box((0.1, 3.4, 2.5), (0.05, 12.3, 1.25), M['counter_r'])
lc_obj.done()

# Kitchenette on W arm
kit = MB("Room_Kitchenette")
# Induction plate
kit.box((0.9, 0.7, 0.08), (0.75, 13.0, 2.7), M['induction'])
kit.cyl(0.15, 0.02, (0.65, 13.0, 2.75), M['induction'])  # burner ring
# Mini fridge under counter
kit.box((0.9, 0.8, 1.8), (0.75, 12.1, 0.9), M['fridge'])
kit.done()

# Storage cupboard (SW corner, 5.5ft along W wall)
st = MB("Room_Storage")
st.box((1.4, 5.5, ROOM_H-0.5), (0.75, 7.75, ROOM_H/2-0.25), M['storage'])
# Shelf dividers
for i in range(1, 5):
    st.box((1.3, 5.4, 0.05), (0.75, 7.75, i*2.0), M['storage'])
st.done()

# Bed (6ft×6ft king, S zone, head to South)
bd = MB("Room_Bed")
# Frame
bd.box((6.0, 6.0, 0.8), (4.7, 8.0, 0.4), M['bed'])
# Mattress
bd.box((5.8, 5.8, 0.4), (4.7, 8.0, 1.0), M['bed'])
# Pillows (head at South, Y=5)
bd.box((1.2, 0.6, 0.3), (3.2, 5.4, 1.35), M['pillow'])
bd.box((1.2, 0.6, 0.3), (4.7, 5.4, 1.35), M['pillow'])
bd.box((1.2, 0.6, 0.3), (6.2, 5.4, 1.35), M['pillow'])
bd.done()

# Room door (NE corner, Y=11 to Y=14, hinged N at Y=14)
rd_pivot = bpy.data.objects.new("Room_Door_Pivot", None)
col.objects.link(rd_pivot)
rd_pivot.location = (9, 14, 0)
rd_pivot.rotation_euler = (0, 0, 0.5)  # ajar, swings along N wall
rd = MB("Room_Door")
rd.box((0.15, 3.0, 7.0), (-0.1, -1.5, 3.5), M['door'])
rd.cyl(0.04, 0.15, (-0.15, -2.8, 3.3), M['chrome'], ax='X')
obj_rd = rd.done()
obj_rd.parent = rd_pivot

# Louver window (E wall, Y=5 to Y=11, 6ft)
lw = MB("Room_Louver_Window")
lw.box((0.15, 6.0, ROOM_H-1), (9.0, 8.0, ROOM_H/2-0.5), M['louver'])
# Slats
for i in range(20):
    lw.box((0.12, 5.8, 0.03), (9.05, 8.0, 0.5+i*0.45), M['louver'])
lw.done()

# Room high louvre (W wall @7ft)
rl = MB("Room_High_Louvre")
rl.box((0.15, 1.0, 1.0), (0, 13.0, 7.5), M['exhaust'])
for i in range(4):
    rl.box((0.12, 0.9, 0.03), (-0.05, 13.0, 7.1+i*0.25), M['exhaust'])
rl.done()

# Room fan (center)
fan = MB("Room_Fan")
fan.cyl(0.6, 0.08, (4.5, 9.5, 9.5), M['metal'])
fan.done()

# ============================================================
# 6. SOUTH CANTILEVER + OUTDOOR COUNTER
# ============================================================
oc = MB("Outdoor_Counter")
# Counter slab (SW, 6ft wide, 2ft deep, against S wall exterior)
oc.box((6.0, 2.0, 0.12), (3.0, 3.8, 2.56), M['outdoor'])
# Counter back (against S wall)
oc.box((6.0, 0.1, 2.5), (3.0, 4.95, 1.25), M['outdoor'])
# Legs
oc.box((0.15, 0.15, 2.4), (0.2, 3.0, 1.2), M['metal'])
oc.box((0.15, 0.15, 2.4), (5.8, 3.0, 1.2), M['metal'])
# Storage shelf below
oc.box((5.8, 1.8, 0.08), (3.0, 3.8, 1.2), M['outdoor'])
oc.done()

# ============================================================
# 7. CAR PARKING
# ============================================================
pk = MB("Car_Parking")
# Auto shutter (NW corner, on W boundary)
pk.box((0.15, 3.0, 7.0), (-5, 30, 3.5), M['shutter'])
pk.done()

# ============================================================
# 8. CAMERAS
# ============================================================
# Perspective (overview from SE, elevated)
bpy.ops.object.camera_add(location=(22, -10, 20), rotation=(math.radians(55), 0, math.radians(65)))
cam = bpy.context.active_object
cam.name = "Cam_Perspective"
cam.data.lens = 24
bpy.context.scene.camera = cam

# Top-down (plan view)
bpy.ops.object.camera_add(location=(4.5, 17.5, 45), rotation=(0, 0, 0))
cam2 = bpy.context.active_object
cam2.name = "Cam_TopDown"
cam2.data.type = 'ORTHO'
cam2.data.ortho_scale = 45

# Toilet detail
bpy.ops.object.camera_add(location=(15, 11, 12), rotation=(math.radians(55), 0, math.radians(60)))
cam3 = bpy.context.active_object
cam3.name = "Cam_Toilet"
cam3.data.lens = 28

# Room detail
bpy.ops.object.camera_add(location=(16, 2, 12), rotation=(math.radians(55), 0, math.radians(60)))
cam4 = bpy.context.active_object
cam4.name = "Cam_Room"
cam4.data.lens = 28

# Entry view (from East, looking into room door)
bpy.ops.object.camera_add(location=(14, 12.5, 4), rotation=(math.radians(82), 0, math.radians(90)))
cam5 = bpy.context.active_object
cam5.name = "Cam_Entry"
cam5.data.lens = 24

# ============================================================
# 9. LIGHTING
# ============================================================
bpy.ops.object.light_add(type='SUN', location=(15, 15, 20))
sun = bpy.context.active_object
sun.name = "Sun"
sun.data.energy = 3.0
sun.data.color = (1.0, 0.95, 0.85)
sun.rotation_euler = (math.radians(45), math.radians(15), math.radians(30))

bpy.ops.object.light_add(type='AREA', location=(4.5, 17, 9.5))
f1 = bpy.context.active_object
f1.name = "Toilet_Light"
f1.data.energy = 200
f1.data.size = 4

bpy.ops.object.light_add(type='AREA', location=(4.5, 9.5, 9.5))
f2 = bpy.context.active_object
f2.name = "Room_Light"
f2.data.energy = 200
f2.data.size = 4

bpy.ops.object.light_add(type='POINT', location=(3, 3, 5))
f3 = bpy.context.active_object
f3.name = "Cantilever_Light"
f3.data.energy = 50

# ============================================================
# 10. RENDER SETTINGS
# ============================================================
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.samples = 128
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.film_transparent = True

world = bpy.data.worlds.new("NW_World")
sc.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (0.05, 0.08, 0.12, 1)
bg.inputs["Strength"].default_value = 0.3

# ============================================================
# DONE
# ============================================================
bpy.ops.object.select_all(action='DESELECT')
print("\n" + "="*65)
print("GREENEYE NW CORNER — COMPLETE MODEL LOADED")
print("="*65)
print("Objects:")
print("  Floors, Walls, Roof_Slab")
print("  Toilet: WC, Glass_Partition, Door, Urinal, Handwash,")
print("          Shower, Geyser, Ventilation")
print("  Room:   L_Counter, Kitchenette, Storage, Bed, Door,")
print("          Louver_Window, High_Louvre, Fan")
print("  Outdoor_Counter, Car_Parking")
print("Cameras: Perspective, TopDown, Toilet, Room, Entry")
print("Lights:  Sun, Toilet_Light, Room_Light, Cantilever_Light")
print("="*65)
print("Press Z → Material Preview | Numpad 0 → Camera | F12 → Render")
print("Switch cameras: Properties → Scene → Camera dropdown")
print("="*65 + "\n")
