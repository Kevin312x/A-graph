const grid = document.querySelector('.grid-container');

const cells_list_2d = [];
let wall_cells = new Set;
let start_cell;
let end_cell;

class Cell {
    g_cost = Number.MAX_SAFE_INTEGER; // Distance from start cell
    h_cost = Number.MAX_SAFE_INTEGER; // Distance from end cell
    f_cost = Number.MAX_SAFE_INTEGER; // Sum of g_cost and h_cost
    parent_cell = null; // Previous cell (for tracing)
    constructor(x_pos, y_pos) {
        this.x_pos = x_pos;
        this.y_pos = y_pos;
    }
}

// Creates a grid
function create_grid() {
    for(let i = 0; i < 20; ++i) {
        let cells_list_1d = [];
        for(let j = 0; j < 20; ++j) {
            // Creates a cell element
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('id', `${i} ${j}`);
            grid.appendChild(cell);

            // Create a cell object and inserts it into a array
            cells_list_1d.push(new Cell(i, j));
        }

        // Insert a list of 20 cells into another array to create a 2d array
        cells_list_2d.push(cells_list_1d);
    }

    // Grabs all the elements with cell class
    let cells = document.querySelectorAll('.cell');

    let is_down = false;
    document.addEventListener('mousedown', (e) => { is_down = true; });
    document.addEventListener('mouseup', (e) => { is_down = false; });

    // Adds 'click' event listener for each cell class that adds the cell into the 
    // wall_cell array and changes background color to denote the change
    cells.forEach((cell) => {
        cell.addEventListener('mouseover', (e) => {
            if(is_down) {
                let ele = e.target;
                cell.classList.add('wall');

                // Retrieves the x and y position from the id of the element
                let pos = ele.attributes.id.value.split(' ');
                let x_pos = parseInt(pos[0]);
                let y_pos = parseInt(pos[1]);

                // Add the cell object containing both the x and y pos to wall_cells
                wall_cells.add(cells_list_2d[x_pos][y_pos]); 
            }
        });

        cell.addEventListener('click', (e) => {
            // Selects the element
            let ele = e.target;

            // Retrieves the x and y position from the id of the element
            let pos = ele.attributes.id.value.split(' ');
            let x_pos = parseInt(pos[0]);
            let y_pos = parseInt(pos[1]);

            if(e.ctrlKey) {
                let prev_start_cell = document.querySelector('.start');
                if(prev_start_cell) { prev_start_cell.classList.remove('start'); }

                cell.classList.add('start');
                start_cell = cells_list_2d[x_pos][y_pos];
            } else if(e.altKey) {
                let prev_end_cell = document.querySelector('.end');
                if(prev_end_cell) { prev_end_cell.classList.remove('end'); }

                cell.classList.add('end');
                end_cell = cells_list_2d[x_pos][y_pos];
            }
        });
    });
}

async function astar_pathfinding() {
    if(!start_cell || !end_cell) { return; }
    start_cell.g_cost = 0;
    start_cell.h_cost = 0;
    start_cell.f_cost = 0;

    let open = [];
    let closed = [];
    open.push(start_cell)

    while(true) {
        let f_cost_low = open[0];
        let f_cost_pos = 0;

        for(let i = 1; i < open.length; ++i) {
            if(open[i].f_cost < f_cost_low.f_cost) {
                f_cost_low = open[i];
                f_cost_pos = i;
            }
        }

        open.splice(f_cost_pos, 1);
        closed.push(f_cost_low);

        if(f_cost_low == end_cell) { break; }

        let neighbors = [];
        let pn_x_axis = [f_cost_low.x_pos - 1, f_cost_low.x_pos, f_cost_low.x_pos + 1];
        let pn_y_axis = [f_cost_low.y_pos - 1, f_cost_low.y_pos, f_cost_low.y_pos + 1];

        for(let x = 0; x < pn_x_axis.length; ++x) {
            for(let y = 0; y < pn_y_axis.length; ++y) {
                if(pn_x_axis[x] < 0 || pn_x_axis[x] > 19 || 
                    pn_y_axis[y] < 0 || pn_y_axis[y] > 19) { continue; }

                if(pn_x_axis[x] == f_cost_low.x_pos && pn_y_axis[y] == f_cost_low.y_pos) { continue; }
                neighbors.push(cells_list_2d[pn_x_axis[x]][pn_y_axis[y]]);
            }
        }

        for(let i = 0; i < neighbors.length; ++i) {
            if(wall_cells.has(neighbors[i]) || closed.includes(neighbors[i])) { continue; }
            document.getElementById(`${neighbors[i].x_pos} ${neighbors[i].y_pos}`).classList.add('visited');

            let g_cost = f_cost_low.g_cost + calc_dist(f_cost_low, neighbors[i]);
            let h_cost = calc_dist(end_cell, neighbors[i]);
            let f_cost = g_cost + h_cost;

            if(f_cost < neighbors[i].f_cost) {
                neighbors[i].g_cost = g_cost;
                neighbors[i].h_cost = h_cost;
                neighbors[i].f_cost = f_cost;
                neighbors[i].parent_cell = f_cost_low;
            }

            if(!open.includes(neighbors[i])) { open.push(neighbors[i]) }
        }
        await sleep(25);
    }

    if(end_cell.parent_cell != null) {
        let traverse_cell = end_cell.parent_cell;
        do {
            let path_cell = document.getElementById(`${traverse_cell.x_pos} ${traverse_cell.y_pos}`);
            path_cell.classList.add('path');
            traverse_cell = traverse_cell.parent_cell;
        } while(traverse_cell != start_cell);
    }
}

// Calculates distances
// Also used to 'approximate' h_cost
function calc_dist(first_cell, second_cell) {
    // Distance formula = sqrt((x2 - x1)^2 + (y2-y1)^2)
    let h_cost_estimation = (Math.sqrt(Math.pow((second_cell.x_pos - first_cell.x_pos), 2) + 
                            Math.pow((second_cell.y_pos - first_cell.y_pos), 2))) * 10;
    return Math.floor(h_cost_estimation);
}


function clear_grid() {
    start_cell = undefined;
    end_cell = undefined;

    const cells_list = document.querySelectorAll('.cell');
    cells_list.forEach((cell) => {
        if(cell.classList.length > 1) { cell.classList = "cell" }
    });

    for(let i = 0; i < cells_list_2d.length; ++i) {
        for(let j = 0; j < cells_list_2d[0].length; ++j) {
            cells_list_2d[i][j] = new Cell(i, j);
        }
    }
    
    wall_cells = new Set;
}

function reset_grid() {
    document.getElementById(`${end_cell.x_pos} ${end_cell.y_pos}`).classList.remove('visited');
    end_cell = new Cell(end_cell.x_pos, end_cell.y_pos);
    cells_list_2d[end_cell.x_pos][end_cell.y_pos] = end_cell

    const visited_cells = document.querySelectorAll('.visited');
    visited_cells.forEach((cell) => {
        let pos = cell.getAttribute('id').split(' ');
        console.log(pos[0], pos[1])
        cells_list_2d[pos[0]][pos[1]] = new Cell(parseInt(pos[0]), parseInt(pos[1]));
        cell.classList = 'cell';
    });
}

function sleep(ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms); })
}

create_grid();