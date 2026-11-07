struct UniformData {
    minimap_start: vec2u,
    minimap_dimension: vec2u,
    game_size: vec2u,
    canvas_size: vec2f,
}

struct VsOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
}

@group(0) @binding(0)
var<uniform> uniform_data: UniformData;

@group(0) @binding(1)
var<storage, read> grid: array<u32>;

@vertex
fn vs_main(
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32,
) -> VsOutput {
    let x = instance_index % uniform_data.minimap_dimension.x;
    let y = instance_index / uniform_data.minimap_dimension.x;

    let step = xy_to_clip_space_step();
    let cs = xy_to_clip_space(x, y);

    let quad_array = array<vec2f, 4>(
            vec2f(cs.x, cs.y),
            vec2f(cs.x + step.x, cs.y),
            vec2f(cs.x + step.x, cs.y + step.y),
            vec2f(cs.x, cs.y + step.y),
        );

    let indices = array<u32, 6>(0, 1, 2, 2, 3, 0);

    var vs_output: VsOutput;

    vs_output.position = vec4f(quad_array[indices[vertex_index]], 0, 1);

    let real_x = uniform_data.minimap_start.x + x;
    let real_y = uniform_data.minimap_start.y + y;
    let index = xy_to_index(real_x, real_y);
    let value = grid[index];

    vs_output.color = select(vec4f(1, 1, 1, 0), vec4f(0, 0, 0, 1), value == 1);
    return vs_output;
}

@fragment
fn fs_main(fs_input: VsOutput) -> @location(0) vec4f {
    return fs_input.color;
}

fn xy_to_index(x: u32, y: u32) -> u32 {
    return y * uniform_data.game_size.x + x;
}

fn xy_to_clip_space_step() -> vec2f {
    let cell_size = uniform_data.canvas_size.x / f32(uniform_data.minimap_dimension.x);
    return vec2f(
            cell_size / uniform_data.canvas_size.x * 2,
            -(cell_size / uniform_data.canvas_size.y) * 2,
        );
}

fn xy_to_clip_space(x: u32, y: u32) -> vec2f {
    let step = xy_to_clip_space_step();
    let cs_x = (f32(x) * step.x) - 1;
    let cs_y = (f32(y) * step.y) + 1;
    return vec2f(cs_x, cs_y);
}
