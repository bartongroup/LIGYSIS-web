
for (const [key, value] of Object.entries(seg_ress_dict)) {
    let PDBResNums = seg_ress_dict[key].map(el => Up2PdbDict[repPdbId][repPdbChainId][el]);
    if (key == "ALL_BINDING") {

        surfsDict["non_binding"] = viewer.addSurface(
            $3Dmol.SurfaceType.ISO,
            {
                color: 'white',
                opacity: 0.0,
            },
            {resi: PDBResNums, invert: true},
            {hetflag: false},
        );
        //print resnums
        console.log(PDBResNums);
    }
    else {
        let siteColor = chartColors[Number(key.split("_").pop())];
        surfsDict[key] = viewer.addSurface(
            $3Dmol.SurfaceType.ISO,
            {
                color: siteColor,
                opacity: 0.0,
            },
            {resi: PDBResNums},
            {resi: PDBResNums},
        );
    }
}

// add individual residue labels here
// print that surfaces are added
console.log("Surfaces added");


viewer.render();