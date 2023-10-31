
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

        // for (PDBResNum in PDBResNums) {
        //     viewer.addLabel(
        //         Pdb2UdDict[repPdbId][repPdbChainId][PDBResNum],
        //         {
        //             alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
        //             borderColor: 'black', borderOpacity: 1, borderThickness: 2,
        //             font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
        //             inFront: true, screenOffset: [0, 0, 0], showBackground: true
        //         },
        //         {resi: PDBResNum},
        //         noshow: true,
        //     );
        // }
    }
}

// add individual residue labels here


viewer.render();