@group(0) @binding(0)
var<uniform> game_size: vec2u;

@group(0) @binding(1)
var<storage, read> current_grid: array<u32>;

@group(0) @binding(2)
var<storage, read_write> next_grid: array<u32>;

@compute @workgroup_size(16, 16)
fn compute(@builtin(global_invocation_id) global_invocation_id: vec3u) {
    let x = global_invocation_id.x;
    let y = global_invocation_id.y;
    if x >= game_size.x || y >= game_size.y {
        return;
    }
    let new_state = get_new_cell_state(x, y);
    let index = xy_to_index(x, y);
    next_grid[index] = new_state;
}

fn get_new_cell_state(x: u32, y: u32) -> u32 {
    let nb_neighboors_alive = get_neighboors_alive(x, y);
    let index = xy_to_index(x, y);
    let value = current_grid[index];
    if value == 0 && nb_neighboors_alive == 3 {
        return 1;
    } else if value == 1 && (nb_neighboors_alive < 2 || nb_neighboors_alive > 3) {
        return 0;
    } else {
        return value;
    }
}

fn xy_to_index(x: u32, y: u32) -> u32 {
    return y * game_size.x + x;
}

fn get_neighboors_alive(x: u32, y: u32) -> u32 {
    var nb = 0u;
    var testor = vec2i(0, 0);
    for(var i = -1; i <= 1; i++) {
        for(var j = -1; j <= 1; j++) {
            if i == 0 && j == 0 {
                continue;
            }
            testor = vec2i(i32(x), i32(y)) + vec2i(i, j);
            if 0 <= testor.x && testor.x < i32(game_size.x) && 0 <= testor.y
                && testor.y < i32(game_size.y) {
                let pos_neighboor = vec2u(testor);
                let index_neighboor = xy_to_index(pos_neighboor.x, pos_neighboor.y);
                if current_grid[index_neighboor] == 1 {
                    nb += 1;
                }
            }
        }
    }
    return nb;
}
