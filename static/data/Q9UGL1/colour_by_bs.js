let mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1761);

mySel.forEach(atom => {
    atom.properties["bs"] = 0;
});


mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1762);

mySel.forEach(atom => {
    atom.properties["bs"] = 1;
});


mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1763);

mySel.forEach(atom => {
    atom.properties["bs"] = 2;
});


mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1764);

mySel.forEach(atom => {
    atom.properties["bs"] = 3;
});


mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1765);

mySel.forEach(atom => {
    atom.properties["bs"] = 4;
});

mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1766);

mySel.forEach(atom => {
    atom.properties["bs"] = 5;
});

mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1767);

mySel.forEach(atom => {
    atom.properties["bs"] = 6;
});

mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1768);

mySel.forEach(atom => {
    atom.properties["bs"] = 7;
});

mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1769);

mySel.forEach(atom => {
    atom.properties["bs"] = 8;
});

mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1770);

mySel.forEach(atom => {
    atom.properties["bs"] = 9;
});


mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1771);

mySel.forEach(atom => {
    atom.properties["bs"] = 10;
});

mySel = viewer.models[1].atoms.filter(atom => atom.resn === 'EDO' & atom.resi === 1772);

mySel.forEach(atom => {
    atom.properties["bs"] = 11;
});

let colorGrad = new $3Dmol.Gradient.ROYGB(0,11);

let myScheme = {min: 0, max: 11, prop: "bs", gradient: colorGrad}

viewer.setStyle({resn: 'EDO', model: 1, resi: "1761-1772",}, {stick: {colorscheme: myScheme, hide: false}});

viewer.render()
