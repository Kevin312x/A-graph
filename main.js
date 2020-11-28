const grid = document.querySelector('.grid-container');

const cells_list_2d = [];
let visited_cells = [];
let wall_cells = new Set;

class Cell {
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

    // Adds 'click' event listener for each cell class that adds the cell into the 
    // wall_cell array and changes background color to denote the change
    cells.forEach((cell) => {
        cell.addEventListener('click', (e) => {
            // Selects the element
            let ele = e.target;
            ele.style.backgroundColor = "#ddd";

            // Retrieves the x and y position from the id of the element
            let pos = ele.attributes.id.value.split(' ')
            let x_pos = pos[0];
            let y_pos = pos[1];

            // Add the cell object containing both the x and y pos to wall_cells
            wall_cells.add(cells_list_2d[x_pos][y_pos]);
        });
    });
}

function check() {
    console.log(wall_cells);
}

create_grid();