// This script is used to highlight/clear a binding site chart point when the corresponding table row is hovered over/mouseout.

$('table#bss_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows

    siteAssemblyPDBResNums = [];

    SuppHoveredSiteResidues = null;
    AssemblyHoveredSiteResidues = [];

    let rowId = this.id;  // gets the row id of the table row that is hovered over
    let siteColor = chartColors[Number(rowId)]; // gets the binding site color of the table row that is hovered over

    if (!this.classList.contains('clicked-row')) { // row is not clicked

        highlightTableRow(rowId); // highlights the table row of the binding site

        let index = chartData[chartLab].indexOf(Number(rowId)); // gets the index of the row id in the chart data

        if (index !== -1) {
            resetChartStyles(myChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }

        if (surfaceVisible) { // if surface is visible
            if (activeModel == "superposition") {
                if (clickedBindingRess.length > 0) { // if binding residues are clicked, hide all their surfaces
                    let commonRess = clickedBindingRess.filter(res => seg_ress_dict[rowId].includes(res)); // find common residues between clicked binding residues and hovered binding site
                    if (commonRess.length > 0) { // if there are common residues, show their surfaces
                        for (const commonRes of commonRess) {
                            if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(commonRes)) {
                                var surfObject = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][commonRes];
                                var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                                viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHiddenOpacity});
                            }
                        }
                    }
                }
                for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                    if (key == rowId) {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHighOpacity}); // change the surface color of the hovered binding site row
                    }
                }
            }
            else {
                if (clickedBindingRess.length > 0) { // if binding residues are clicked, hide all their surfaces
                    let commonRess = clickedBindingRess.filter(res => seg_ress_dict[rowId].includes(res)); // find common residues between clicked binding residues and hovered binding site
                    if (commonRess.length > 0) { // if there are common residues, show their surfaces
                        proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                            for (const commonRes of commonRess) {
                                let ResKey = element + "_" + commonRes; // create a key for the residue
                                if (surfsDict[activeModel]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                    var surfObject = surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey];
                                    var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                                    viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHiddenOpacity});
                                }
                            }
                        });
                    }
                }
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    for (const [key2, value2] of Object.entries(value)) {
                        if (key == rowId) {
                            viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHighOpacity}); // change the surface color of the hovered binding site row
                        }
                    }
                }
            }
        }
    }

    if (activeModel == "superposition") {

        siteSuppPDBResNums = seg_ress_dict[rowId]
            .filter(el => Up2PdbDict[repPdbId][labelAsymId].hasOwnProperty(el)) // this accounts not for missing residues in the structure (unresolved)
            .map(el => Up2PdbDict[repPdbId][labelAsymId][el]);

        SuppHoveredSiteResidues = {model: protAtomsModel, resi: siteSuppPDBResNums, chain: authAsymId, not: {atom: bboneAtoms}}

        viewer.setStyle(
            SuppHoveredSiteResidues,
            {
                cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                stick:{color: siteColor},
            }
        );
    }
    else {
        proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
            let siteAssemblyPDBResNum = seg_ress_dict[rowId]
                .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el)) // filters out site residues not present in this assembly. otherwise mapping is undefined and causes problems later...
                .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);

            siteAssemblyPDBResNums.push([element, siteAssemblyPDBResNum]);

            let assemblySel = {model: activeModel, resi: siteAssemblyPDBResNum, chain: element, not: {atom: bboneAtoms}}; // used to be protAtomsModel. WRONG!?
            AssemblyHoveredSiteResidues.push(assemblySel);
        });
        if (contactsVisible) {
            let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
            defaultColors.C = siteColor;
            viewer.setStyle(
                {model: activeModel, or: AssemblyHoveredSiteResidues},
                {
                    cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                    stick:{colorscheme: defaultColors},
                }
            );
        }
        else {
            viewer.setStyle(
                {model: activeModel, or: AssemblyHoveredSiteResidues},
                {
                    cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                    stick:{color: siteColor},
                }
            );
        }
        
    }
    viewer.render();
    
}).on('mouseout', 'tr', function () {

    let rowId = Number(this.id);  // gets the row id of the table row that is hovered over
    let siteColor = chartColors[Number(rowId)];
    let index = chartData[chartLab].indexOf(rowId); // gets the index of the row id in the chart data
    let classList = this.classList;
    let clickedElements = document.getElementsByClassName("clicked-row");
    
    if (!classList.contains('clicked-row')) { // row is not clicked

        if (classList.contains('highlighted-row')) {
            clearHighlightedRow(); // clears highlighted table row
            resetChartStyles(myChart, index, "black", 1, 12); // resets chart styles to default
        }

        if (activeModel == "superposition") {
            viewer.setStyle(
                SuppHoveredSiteResidues,
                {
                    cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff}
                }
            );
            // colour again clicked residues
            if (!clickedBindingRess.length == 0) {
                let clickedBindingRessSel = clickedBindingRess.map(res => Up2PdbDict[repPdbId][labelAsymId][res]);
                let displayedSiteColour = chartColors[Number(CurrentDisplayedSite)]; // colour of the clicked binding site
                viewer.setStyle(
                    {...protAtoms, model: protAtomsModel, resi: clickedBindingRessSel, not: {atom: bboneAtoms}},
                    {cartoon: {style: cartoonStyle, color: displayedSiteColour, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                    stick: {color: displayedSiteColour},}
                ); 
            }
        }
        else {
            viewer.setStyle(
                {model: activeModel, or: AssemblyHoveredSiteResidues},
                {
                    cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                }
            );
            if (contactsVisible) {
                // viewer.setStyle(
                //     {model: activeModel, or: AssemblyHoveredSiteResidues}, // hiding all the hovered site residues
                //     {
                //         cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                //     }
                // );
                // colour ligand-binding residues again
                for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                    defaultColors.C = value[2];
                    viewer.setStyle( // displaying and colouring again the ligand-interacting residues
                        {model: activeModel, or: value[0]}, // value[0] are the ligand-binding residues selection
                        {
                            cartoon:{style: cartoonStyle, color: value[2], arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                            stick:{hidden: false, colorscheme: defaultColors,} // value[2] is colour of the binding site
                        }
                    );
                }
            }
            else {
                // viewer.setStyle(
                //     {model: activeModel, or: AssemblyHoveredSiteResidues},
                //     {
                //         cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                //     }
                // );
            }
            if (!clickedBindingRess.length == 0) {
                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                    let clickedBindingRessSel = clickedBindingRess.map(res => Up2PdbMapAssembly[chainsMapAssembly[element]][res]);
                    let displayedSiteColour = chartColors[Number(CurrentDisplayedSite)]; // colour of the clicked binding site
                    viewer.setStyle(
                        {model: activeModel, resi: clickedBindingRessSel, chain: element, not: {atom: bboneAtoms}},
                        {cartoon: {style: cartoonStyle, color: displayedSiteColour, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                        stick: {color: displayedSiteColour},}
                    );
                });
            }
        }

        if (clickedElements.length == 0) {
            if (surfaceVisible) { // if surface is visible
                if (activeModel == "superposition") {
                    if (clickedBindingRess.length == 0) { // if no binding residues are clicked, show all surfaces
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfLowOpacity});
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfMediumOpacity});
                            }
                        }
                    }
                    else {// if binding residues are clicked, hide the un-hovered site surface (clicked residue surfaces will remain)
                        //show surfaces of all clicked binding residues. loop through clickedBindingRess
                        for (const rowId of clickedBindingRess) {
                            let SuppPDBResNum = Up2PdbDict[repPdbId][labelAsymId][rowId];
                            if (SuppPDBResNum !== undefined) {
                                if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(rowId)) {
                                    var surfObject = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][rowId];
                                    var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                                    viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHighOpacity});
                                }
                                else { // need to create surfaces because they were not created before since site was already clicked
                                    let surfSel = {model: protAtomsModel, resi: SuppPDBResNum, chain: authAsymId};
                                    let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                        .filter(el => Up2PdbDict[repPdbId][labelAsymId].hasOwnProperty(el))
                                        .map(el => Up2PdbDict[repPdbId][labelAsymId][el]);
                                    let SiteSel = {model: protAtomsModel, chain: authAsymId, resi: SitePDBResNums};
                                    surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][rowId] = viewer.addSurface(
                                        $3Dmol.SurfaceType.ISO,
                                        {
                                            color: siteColor,
                                            opacity: surfHighOpacity,
                                        },
                                        surfSel,
                                        SiteSel,
                                    );
                                }
                            }
                            else {
                                //
                            }
                            
                        }                        
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"][rowId].surfid, {color: siteColor, opacity: surfHiddenOpacity});
                    }
                }
                else {
                    var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                    if (contactsVisible) {
                        for (const [key, value] of Object.entries(surfsDict[activeModel][rowId])) { // one per chain in assembly
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHiddenOpacity}); // just hide the hovered binding site surface (the ligand-binding residues surfaces will remain)
                        }
                        if (clickedBindingRess.length > 0) {
                            proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                                for (const clickedRes of clickedBindingRess) {
                                    let ResKey = element + "_" + clickedRes; // create a key for the residue
                                    if (surfsDict[activeModel]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                        var surfObject = surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey];
                                        viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHighOpacity});
                                    }
                                    else { // need to create surfaces because they were not created before since site was already clicked
                                        let surfSel = {model: activeModel, resi: Up2PdbMapAssembly[chainsMapAssembly[element]][clickedRes], chain: element};
                                        let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                            .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                                            .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                                        let SiteSel = {model: activeModel, chain: element, resi: SitePDBResNums};
                                        surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                            $3Dmol.SurfaceType.ISO,
                                            {
                                                color: currentSiteColor,
                                                opacity: surfHighOpacity,
                                            },
                                            surfSel,
                                            SiteSel,
                                        );    
                                    }
                                }
                            });
                        }
                    }
                    else { // if contacts are not visible, show all surfaces
                        if (clickedBindingRess.length == 0) { // if no binding residues are clicked, show all surfaces}
                            for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                                for (const [key2, value2] of Object.entries(value)) {
                                    if (key == "lig_inters") { // do nothing for these surfaces
                                        // pass
                                    }
                                    else if (key == "non_binding") {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfLowOpacity});
                                    }
                                    else if (key == "single_residues") { // do nothing for these surfaces
                                        // pass
                                    }
                                    else {
                                        let siteColor = chartColors[Number(key.split("_").pop())];
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfMediumOpacity});
                                    }
                                }
                            }
                        }
                        else { // there are binding residues clicked, hide the un-hovered site surface (clicked residue surfaces will remain or might need to create)
                            for (const [key, value] of Object.entries(surfsDict[activeModel][rowId])) { // one per chain in assembly
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHiddenOpacity}); // just hide the hovered binding site surface (the ligand-binding residues surfaces will remain)
                            }
                            proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                                for (const clickedRes of clickedBindingRess) {
                                    let ResKey = element + "_" + clickedRes; // create a key for the residue
                                    if (surfsDict[activeModel]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                        var surfObject = surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey];
                                        viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHighOpacity});
                                    }
                                    else { // need to create surfaces because they were not created before since site was already clicked
                                        let surfSel = {model: activeModel, resi: Up2PdbMapAssembly[chainsMapAssembly[element]][clickedRes], chain: element};
                                        let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                            .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                                            .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                                        let SiteSel = {model: activeModel, chain: element, resi: SitePDBResNums};
                                        surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                            $3Dmol.SurfaceType.ISO,
                                            {
                                                color: currentSiteColor,
                                                opacity: surfHighOpacity,
                                            },
                                            surfSel,
                                            SiteSel,
                                        );    
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
        else {
            let clickedElement = clickedElements[0]; // clicked row
            
            let clickedSiteColor = chartColors[Number(clickedElement.id)]; // color of the clicked binding site

            if (activeModel == "superposition") {
                viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                    SuppClickedSiteResidues,
                    {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                    stick:{color: clickedSiteColor,}, }
                );
            }
            else {
                if (contactsVisible) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                    defaultColors.C = clickedSiteColor; // used  to be ligCol
                    viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                        {model: activeModel, or: AssemblyClickedSiteResidues},
                        {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                        stick:{colorscheme: defaultColors,}, }
                    );
                }
                else {
                    viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                        {model: activeModel, or: AssemblyClickedSiteResidues},
                        {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                        stick:{color: clickedSiteColor,}, }
                    );
                }
            }
            if (surfaceVisible) {
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == rowId) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHiddenOpacity});
                        }
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == rowId) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHiddenOpacity});
                            }
                        }
                    }
                }
            }
        }
        viewer.render();
    }
    
}).on('click', 'tr', function () {
    
    let rowId = this.id;  // gets the row id of the table row that is clicked
    let index = chartData[chartLab].indexOf(Number(rowId)); // gets the index of the row id in the chart data
    let siteColor = chartColors[Number(rowId)];//.split("_").pop())]; // gets the binding site color of the table row that is hovered over
    let classList = this.classList;
    let clickedElements = document.getElementsByClassName("clicked-row");

    if (clickedSite !== null) { // if there is already clicked site, remove its labels
        if (labelsVisible) {
            for (const label of labelsHash[activeModel]["clickedSite"][clickedSite]) {
                label.hide();
            }
            if (clickedBindingRess.length > 0) { // but there are clicked binding residues. We need to create/show their labels
                if (activeModel == "superposition") {
                    for (const res of clickedBindingRess) {
                        SuppPDBResNum = Up2PdbDict[repPdbId][labelAsymId][res];
                        if (SuppPDBResNum !== undefined) {
                            if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(res)) {
                                labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][res].show(); // show the label if it exists
                            }
                            else{
                                let resSel = {model: protAtomsModel, resi: SuppPDBResNum, chain: authAsymId}
                                let resName = viewer.selectedAtoms(resSel)[0].resn
                                let label = viewer.addLabel(
                                    resName + String(Pdb2UpDict[repPdbId][labelAsymId][SuppPDBResNum]),
                                    {
                                        alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                        borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    resSel,
                                    false,
                                );
                                labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][res] = label; // store the label in the hash
                            }
                        }
                    }
                }
                else {
                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                        for (const res of clickedBindingRess) {
                            let ResKey = element + "_" + res; // create a key for the residue
                            let resSel = {model: activeModel, resi: Up2PdbMapAssembly[chainsMapAssembly[element]][res], chain: element}
                            let resName = viewer.selectedAtoms(resSel)[0].resn
                            if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].show(); // show the label if it exists
                            }
                            else{
                                let label = viewer.addLabel(
                                    resName + String(Pdb2UpMapAssembly[chainsMapAssembly[element]][res]),
                                    {
                                        alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                        borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    resSel,
                                    false,
                                );
                                labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey] = label; // store the label in the hash
                            }
                        }
                    });
                }
            }
        }
    }
    
    if (classList.contains('clicked-row')) { // row is already clicked
        
        clearClickedRows();
        clickedSite = null;

        if (index !== -1) {
            resetChartStyles(myChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }

        highlightTableRow(rowId); // highlights the table row of the binding site

        SuppClickedSiteResidues = null;
        AssemblyClickedSiteResidues = [];

        if (surfaceVisible) {
            if (activeModel == "superposition") {
                if (clickedBindingRess.length == 0) { // if no binding residues are clicked, show all surfaces
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == "non_binding") {
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: defaultColor, opacity: surfLowOpacity});
                        }
                        else {
                            let siteColor = chartColors[Number(key.split("_").pop())];
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: siteColor, opacity: surfMediumOpacity});
                        }
                    }
                }
                else {
                    // hide clicked residue surfaces
                    for (const clickedRes of clickedBindingRess) {
                        if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(clickedRes)) {
                            var surfObject = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][clickedRes];
                            var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                            viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHiddenOpacity});
                        }
                    }
                    // show surface of just unclicked site
                    viewer.setSurfaceMaterialStyle(surfsDict["superposition"][rowId].surfid, {color: siteColor, opacity: surfHighOpacity});
                }
            }
            else {
                /////////////// CONTINUE HERE. IT IS A MESS!
                // for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                //     for (const [key2, value2] of Object.entries(value)) {
                //         if (contactsVisible) {
                //             // if (key == "lig_inters") { // do nothing for these surfaces
                //             //     // pass
                //             // }
                //             if (key == rowId) {
                //                 viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHiddenOpacity});
                //             }
                //             else {
                //                 //
                //             }
                //         }
                //         else {
                //             // if (key == "lig_inters") { // do nothing for these surfaces
                //             //     // pass
                //             // }
                //             if (key == "non_binding") {
                //                 viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfLowOpacity});
                //             }
                //             else {
                //                 let siteColor = chartColors[Number(key.split("_").pop())];
                //                 viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfMediumOpacity});
                //             }
                //         }
                //     }
                // }
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    if (key == "lig_inters") { // do nothing for these surfaces
                        continue;
                    }
                    if (contactsVisible) {
                        if (key == rowId) {
                            for (const [key2, value2] of Object.entries(value)) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHiddenOpacity});
                            }
                        }
                        else if (key == "single_residues") {
                            if (clickedBindingRess.length == 0) { // if no binding residues are clicked
                                // pass
                            }
                            else {
                                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                                    for (const clickedRes of clickedBindingRess) {
                                        let ResKey = element + "_" + clickedRes; // create a key for the residue
                                        if (surfsDict[activeModel]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                            var surfObject = surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey];
                                            viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: siteColor, opacity: surfHighOpacity});
                                        }
                                        else { // need to create surfaces because they were not created before since site was already clicked
                                            let surfSel = {model: activeModel, resi: Up2PdbMapAssembly[chainsMapAssembly[element]][clickedRes], chain: element};
                                            let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                                .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                                                .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                                            let SiteSel = {model: activeModel, chain: element, resi: SitePDBResNums};
                                            surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                                $3Dmol.SurfaceType.ISO,
                                                {
                                                    color: siteColor,
                                                    opacity: surfHighOpacity,
                                                },
                                                surfSel,
                                                SiteSel,
                                            );    
                                        }
                                    }
                                });
                            }
                        }
                        else {
                            // do nothing for the rest of the surfaces
                        }
                    }
                    else {
                        if (clickedBindingRess.length == 0) { // if no binding residues are clicked
                            if (key == "single_residues") {
                                // pass
                            }
                            else { // going back to all surfaces
                                for (const [key2, value2] of Object.entries(value)) {
                                    if (key == "non_binding") {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfLowOpacity});
                                    }
                                    else {
                                        let siteColor = chartColors[Number(key.split("_").pop())];
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfMediumOpacity});
                                    }
                                }           
                            }
                        }
                        else { // there are binding residues clicked
                            if (key == "single_residues") { // show binding residues surfaces
                                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                                    for (const clickedRes of clickedBindingRess) {
                                        let ResKey = element + "_" + clickedRes; // create a key for the residue
                                        if (surfsDict[activeModel]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                            var surfObject = surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey];
                                            viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: siteColor, opacity: surfHighOpacity});
                                        }
                                        else { // need to create surfaces because they were not created before since site was already clicked
                                            let surfSel = {model: activeModel, resi: Up2PdbMapAssembly[chainsMapAssembly[element]][clickedRes], chain: element};
                                            let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                                .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                                                .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                                            let SiteSel = {model: activeModel, chain: element, resi: SitePDBResNums};
                                            surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                                $3Dmol.SurfaceType.ISO,
                                                {
                                                    color: siteColor,
                                                    opacity: surfHighOpacity,
                                                },
                                                surfSel,
                                                SiteSel,
                                            );    
                                        }
                                    }
                                });
                            }
                            else {
                                // pass
                            }
                        }
                    }
                }
            }
        }
        if (activeModel == "superposition") {
            viewer.zoomTo({model: protAtomsModel});
        }
        else {
            viewer.zoomTo({model: activeModel});
        }
        viewer.setSlab(nearPlane, farPlane);
        viewer.render();
    }
    else {
        let previouslyDisplayedSite = CurrentDisplayedSite; // store the previously clicked site before changing it
        let fullPointLabel = segmentName + "_" + rowId;
        CurrentDisplayedSite = Number(rowId); // changing displayed site
        if (labelsHash[activeModel]["clickedResidues"].hasOwnProperty(rowId)) {
            //
        }
        else {
            labelsHash[activeModel]["clickedResidues"][rowId] = {}; // create an empty array for clicked residues if it doesn't exist
        }
        if (surfsDict[activeModel]["single_residues"].hasOwnProperty(rowId)) {
            //
        }
        else {
            surfsDict[activeModel]["single_residues"][rowId] = {}; // create an empty object for clicked residues if it doesn't exist
        }
        // do the AJAX  call only if the clicked site is not the same as the previously displayed site
        if (previouslyDisplayedSite == rowId) {
            //
        }
        else {
            $.ajax({ // AJAX request to get the table data from the server
                type: 'POST', // POST request
                url: `${window.appBaseUrl}/get-table`, // URL to send the request to
                contentType: 'application/json;charset=UTF-8', // content type
                data: JSON.stringify({'label': fullPointLabel}), // data to send
                success: function(response) { // function to execute when the request is successful
                    const keyOrder = cc; // order of the keys in the response object
                    let tableBody = $('#bs_ress_table tbody'); // tbody of the table
                    tableBody.empty(); // empty the tbody
                    for (var i = 0; i < response[keyOrder[0]].length; i++) { // First loop to iterate through rows
                        let newRow = $('<tr class="table__row">'); // Create a new row
                        newRow.attr('id', response[newChartLab][i]); // Assign ID dynamically to each row
                        $.each(keyOrder, function(j, key) { // Second loop to iterate through keys (columns)
                            newRow.append('<td class="table__cell">' + response[key][i] + '</td>');
                        });
                        newRow[0].style.setProperty('color', siteColor, "important");
                        newRow[0].style.setProperty('--bs-table-color', siteColor);
                        newRow[0].style.setProperty('--bs-table-hover-color', siteColor);
                        tableBody.append(newRow); // Append the new row to the table body
                    }

                    newChartData = response;
                    newChart.data.datasets[0].data = newChartData[newChartY];  // New data
                    newChart.data.datasets[0].backgroundColor = siteColor;
                    newChart.data.datasets[0].pointHoverBackgroundColor = siteColor;
                    newChart.data.labels = newChartData[newChartX];  // New labels (if needed)
                    newChart.update(); // Update the chart
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Request failed:');
                    console.error('Status:', textStatus);
                    console.error('Error:', errorThrown);
                    console.error('Response:', jqXHR.responseText);
                },
            });
        }
        clearHighlightedRow(); // clears highlighting from table row, before applying clicked styles
        if (clickedElements) { // any OTHER row is already clicked
            for (var i = 0; i < clickedElements.length; i++) {
                var clickedElementId = clickedElements[i].id;
                if (activeModel == "superposition") {
                    viewer.setStyle( // colour white previously clicked site residues
                        SuppClickedSiteResidues,
                        {
                            cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff}
                        }
                    );
                }
                else {
                    if (contactsVisible) {
                        console.log("Contacts visible when clicking on a new site");
                        viewer.setStyle(
                            {model: activeModel, or: AssemblyClickedSiteResidues, not: {or: allBindingRess}},  
                            {
                                cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff}
                            }
                        );
                    }
                    else {
                        viewer.setStyle(
                            {model: activeModel, or: AssemblyClickedSiteResidues},
                            {
                                cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff}
                            }
                        );
                    }
                    
                }
                viewer.render();
            }
            clearClickedRows();

            myChart.data.datasets[0].data.forEach(function(point, i) {
                resetChartStyles(myChart, i, "black", 1, 12); // resets chart styles to default
            });
        }

        SuppClickedSiteResidues = null;
        AssemblyClickedSiteResidues = [];

        if (activeModel == "superposition") {
            let siteSuppPDBResNums = seg_ress_dict[rowId]
                .filter(el => Up2PdbDict[repPdbId][labelAsymId].hasOwnProperty(el)) // this accounts not for missing residues in the structure (unresolved)
                .map(el => Up2PdbDict[repPdbId][labelAsymId][el]);

            SuppClickedSiteResidues = {model: protAtomsModel, resi: siteSuppPDBResNums, chain: authAsymId, not: {atom: bboneAtoms}}
            // update selection so that it ignores backbone atoms

            // need to colour the clicked site residues here. Before we were not as it was already hovered. However, when overlap between sites, we need to colour the clicked site.
            viewer.setStyle(
                SuppClickedSiteResidues,
                {
                    cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                    stick:{color: siteColor},
                }
            );

            if (rowId != previouslyDisplayedSite) { // if clicked site is different from previously displayed site, remove labels of previously displayed site
                if (clickedBindingRess.length > 0) {
                    let clickedBindingRessSel = clickedBindingRess.map(res => Up2PdbDict[repPdbId][labelAsymId][res]);
                    // hide sidechains of clicked residues and colour back to default
                    viewer.setStyle({...protAtoms, model: protAtomsModel, resi: clickedBindingRessSel}, // hide sidechains of clicked residues
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                        stick: {color: defaultColor, hidden: true},}
                    );
                    if (surfaceVisible) { // hide previously displayed site clicked residue surfaces
                        for (const clickedRes of clickedBindingRess) {
                            if (surfsDict["superposition"]["single_residues"][previouslyDisplayedSite].hasOwnProperty(clickedRes)) {
                                var surfObject = surfsDict["superposition"]["single_residues"][previouslyDisplayedSite][clickedRes];
                                var previousSiteColor = chartColors[Number(previouslyDisplayedSite)];
                                viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: previousSiteColor, opacity: surfHiddenOpacity});
                            }
                        }
                    }
                    clickedBindingRess = []; // clear clicked binding residues, since we are in a new site
                }
            }
            viewer.zoomTo(SuppClickedSiteResidues);
        }
        else {
            proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                let siteAssemblyPDBResNum = seg_ress_dict[rowId]
                    .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                    .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
    
                siteAssemblyPDBResNums.push([element, siteAssemblyPDBResNum]);
                let assemblySel = {model: activeModel, resi: siteAssemblyPDBResNum, chain: element, not: {atom: bboneAtoms}};
                AssemblyClickedSiteResidues.push(assemblySel);
            });
            if (contactsVisible) {
                let defaultColors = { ...$3Dmol.elementColors.defaultColors };
                defaultColors.C = siteColor;
                viewer.setStyle(
                    {model: activeModel, or: AssemblyClickedSiteResidues},
                    {
                        cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff,},
                        stick:{colorscheme: defaultColors},
                    }
                );
            }
            else {
                viewer.setStyle(
                    {model: activeModel, or: AssemblyClickedSiteResidues},
                    {
                        cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                        stick:{color: siteColor},
                    }
                );
            }
            if (rowId != previouslyDisplayedSite) { // if clicked site is different from previously displayed site, remove labels of previously displayed site
                if (clickedBindingRess.length > 0) {
                    // hide sidechains of clicked residues and colour back to default
                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                        for (const clickedRes of clickedBindingRess) {
                            //hide sidechains of clicked residues
                            let ResKey = element + "_" + clickedRes; // create a key for the residue
                            if (surfaceVisible) {
                                if (surfsDict[activeModel]["single_residues"][previouslyDisplayedSite].hasOwnProperty(ResKey)) {
                                    var surfObject = surfsDict[activeModel]["single_residues"][previouslyDisplayedSite][ResKey];
                                    var previousSiteColor = chartColors[Number(previouslyDisplayedSite)];
                                    viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: previousSiteColor, opacity: surfHiddenOpacity});
                                }
                            }
                            let resSel = {model: activeModel, resi: Up2PdbMapAssembly[chainsMapAssembly[element]][clickedRes], chain: element};
                            viewer.setStyle(resSel,
                                {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                                stick: {color: defaultColor, hidden: true},}
                            );
                        }
                    });
                    clickedBindingRess = []; // clear clicked binding residues, since we are in a new site
                }
            }
            viewer.zoomTo({model: activeModel, or: AssemblyClickedSiteResidues});
        }

        if (index !== -1) {
            resetChartStyles(myChart, index, "#bfd4cb", 10, 16); // changes chart styles to highlight the clicked binding site
        }

        clickTableRow(this);
        clickedSite = rowId; // assigning new value to clickedSite so that we keep track of which site is clicked. Necessary to remove labels when another site is clicked

        // I DO NOT COLOUR THE CLICKED SITE, BECAUSE IN PRINCIPLE, YOU CAN'T CLICK WITHOUT HOVERING FIRST, SO THE SITE IS ALREADY COLOURED.

        if (labelsVisible) {

            // dealing with labels of clicked individual residues
            if (rowId == previouslyDisplayedSite) {
                // if clicked site is the same as displayed site (on residues table), don't need to remove labels
            }
            else {
                for (const [key, label] of Object.entries(labelsHash[activeModel]["clickedResidues"][previouslyDisplayedSite])) {
                    label.hide();
                }
            }
            for (const label of labelsHash[activeModel]["hoveredRes"]) { // don't know how, I guess fast hovering from residues table/chart might leave one label left
                viewer.removeLabel(label);
            }
            labelsHash[activeModel]["hoveredRes"] = [];

            // check if rowId in labelsHash[activeModel]["clickedSite"]
            if (labelsHash[activeModel]["clickedSite"].hasOwnProperty(rowId)) {
                console.log(`Site ${rowId} already clicked and labels exist`);
                for (const label of labelsHash[activeModel]["clickedSite"][rowId]) {
                    label.show();
                }
            }
            else {
                console.log(`Site ${rowId} not clicked yet. Creating labels...`);
                labelsHash[activeModel]["clickedSite"][rowId] = [];
                if (activeModel == "superposition") {
                    for (siteSuppPDBResNum of siteSuppPDBResNums) {
                        let resSel = {model: protAtomsModel, resi: siteSuppPDBResNum, chain: authAsymId}
                        let resName = viewer.selectedAtoms(resSel)[0].resn
                        let label = viewer.addLabel(
                            resName + String(Pdb2UpDict[repPdbId][labelAsymId][siteSuppPDBResNum]),
                            {
                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                            },
                            resSel,
                            false,
                        );
                        labelsHash[activeModel]["clickedSite"][rowId].push(label);
                    }
                }
                else {
                    for ([element, siteAssemblyPDBResNum] of siteAssemblyPDBResNums) {
                        for (siteAssemblyPDBResNumber of siteAssemblyPDBResNum) { // variable name not ideal as siteAssemblyPDBResNum is an array
                            let resSel = {model: activeModel, resi: siteAssemblyPDBResNumber, chain: element}
                            let resName = viewer.selectedAtoms(resSel)[0].resn
                            let label = viewer.addLabel(
                                resName + String(Pdb2UpMapAssembly[chainsMapAssembly[element]][siteAssemblyPDBResNumber]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: siteColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                resSel,
                                false,
                            );
                            labelsHash[activeModel]["clickedSite"][rowId].push(label);
                        }
                    }
                }
            }
        }
        if (surfaceVisible) {
            if (activeModel == "superposition") {
                // if (rowId != previouslyDisplayedSite) { // if clicked site is different from previously displayed site, remove surfaces of previously displayed site
                //     if (clickedBindingRess.length > 0) {
                //         // hide clicked residue surfaces
                //         for (const clickedRes of clickedBindingRess) {
                //             if (surfsDict["superposition"]["single_residues"][previouslyDisplayedSite].hasOwnProperty(clickedRes)) {
                //                 var surfObject = surfsDict["superposition"]["single_residues"][previouslyDisplayedSite][clickedRes];
                //                 var previousSiteColor = chartColors[Number(previouslyDisplayedSite)];
                //                 viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: previousSiteColor, opacity: surfHiddenOpacity});
                //             }
                //         }
                //     }
                // }
                for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                    if (key == rowId) {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHighOpacity});
                    }
                    else {
                        viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                    }
                }
            }
            else {
                for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                    if (key == 'lig_inters') {
                        // pass
                    }
                    else {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == rowId) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHighOpacity});
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                            }
                        }
                    }
                }
            }
        }
    }
    viewer.render();
});

$('table#bs_ress_table tbody').on('mouseover', 'tr', function () { // event listener for mouseover on table rows
    let rowId = Number(this.id);  // gets the row ID of the table row that is hovered over (this corresponds to the UniProt residue number of this row)
    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data
    let rowColor = window.getComputedStyle(this).getPropertyValue('color');
    let rowColorHex = rgbToHex(rowColor);

    let clickedElements = document.getElementsByClassName("clicked-row");

    AssemblyPDBResNums = [];

    if (index !== -1) { // will always be true if we hover over a row
        
        if (clickedBindingRess.includes(rowId)) {
            //
        }
        else { 
            resetChartStyles(newChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }
        
        if (activeModel == "superposition") { // in this case, only one residue as this is a supperposition of single chains
            SuppPDBResNum = Up2PdbDict[repPdbId][labelAsymId][rowId];
            if (SuppPDBResNum !== undefined) {
                viewer.setStyle(
                    {model: protAtomsModel, chain: authAsymId, resi: SuppPDBResNum, not: {atom: bboneAtoms}},
                    {
                        cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                        stick:{color: rowColorHex},
                    }
                );
            }
            else {
                console.log("Residue not found in structure!");
            }
        }
        else {
            proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                let AssemblyPDBResNum = Up2PdbMapAssembly[chainsMapAssembly[element]][rowId]
                AssemblyPDBResNums.push([element, AssemblyPDBResNum]);
                if (AssemblyPDBResNum !== undefined) {
                    if (contactsVisible) {
                        let defaultColors = { ...$3Dmol.elementColors.defaultColors };
                        defaultColors.C = rowColorHex;
                        viewer.setStyle(
                            {model: activeModel, resi: AssemblyPDBResNum, chain: element, not: {atom: bboneAtoms}},
                            {
                                cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                                stick:{colorscheme: defaultColors},
                            }
                        );
                    }
                    else {
                        viewer.setStyle(
                            {model: activeModel, resi: AssemblyPDBResNum, chain: element, not: {atom: bboneAtoms}},
                            {
                                cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                                stick:{color: rowColorHex},
                            }
                        );
                    }
                }
                else {
                    console.log("Residue not found in assembly!");
                }
            });
        }

        if (labelsVisible) {
            for (const label of labelsHash[activeModel]["hoveredRes"]) {
                viewer.removeLabel(label);
            }
            labelsHash[activeModel]["hoveredRes"] = [];

            if (activeModel == "superposition") {
                if (SuppPDBResNum !== undefined) {
                    labelsHash[activeModel]["hoveredRes"] = [];
                    let resSel = {model: protAtomsModel, resi: SuppPDBResNum, chain: authAsymId}
                    let resName = viewer.selectedAtoms(resSel)[0].resn
                    let label = viewer.addLabel(
                        resName + String(Pdb2UpDict[repPdbId][labelAsymId][SuppPDBResNum]),
                        {
                            alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                            borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                            font: 'Arial', fontColor: rowColorHex, fontOpacity: 1, fontSize: 12,
                            inFront: true, screenOffset: [0, 0, 0], showBackground: true
                        },
                        resSel,
                        true,
                    );
                    labelsHash[activeModel]["hoveredRes"].push(label);
                }
            }
            else {
                AssemblyPDBResNums.forEach(([chain, resNum]) => {
                    if (resNum !== undefined) {
                        let resSel = {model: activeModel, resi: resNum, chain: chain}
                        let resName = viewer.selectedAtoms(resSel)[0].resn
                        let label = viewer.addLabel(
                            resName + String(Pdb2UpMapAssembly[chainsMapAssembly[chain]][resNum]),
                            {
                                alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                font: 'Arial', fontColor: rowColorHex, fontOpacity: 1, fontSize: 12,
                                inFront: true, screenOffset: [0, 0, 0], showBackground: true
                            },
                            resSel,
                            true,
                        );
                        labelsHash[activeModel]["hoveredRes"].push(label);
                    }
                });
            }
        }
        if (surfaceVisible) {
            // only show individual residue surfaces if a site is not clicked
            if (clickedElements.length == 0) {

                //console.log("THIS IS BEING EXECUTED");                
                if (activeModel == "superposition") {
                    // show the surface for the hovered residue
                    if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(rowId)) {
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][rowId].surfid, {color: rowColorHex, opacity: surfHighOpacity});
                    }
                    else { // create a new surface for the hovered residue
                        let surfSel = {model: protAtomsModel, resi: SuppPDBResNum, chain: authAsymId};
                        let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                            .filter(el => Up2PdbDict[repPdbId][labelAsymId].hasOwnProperty(el))
                            .map(el => Up2PdbDict[repPdbId][labelAsymId][el]);
                        let SiteSel = {model: protAtomsModel, chain: authAsymId, resi: SitePDBResNums};
                        surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][rowId] = viewer.addSurface(
                            $3Dmol.SurfaceType.ISO,
                            {
                                color: rowColorHex,
                                opacity: surfHighOpacity,
                            },
                            surfSel,
                            SiteSel,
                        );
                    }
                }
                else {
                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                        let ResKey = element + "_" + rowId; // key for the residue in the surface dictionary
                        if (surfsDict[activeModel]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                            viewer.setSurfaceMaterialStyle(surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey].surfid, {color: rowColorHex, opacity: surfHighOpacity});
                        }
                        else {
                            let AssemblyResnum = Up2PdbMapAssembly[chainsMapAssembly[element]][rowId];
                            let surfSel = {model: activeModel, resi: AssemblyResnum, chain: element};
                            let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                                .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                            let SiteSel = {model: activeModel, chain: element, resi: SitePDBResNums};
                            surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                $3Dmol.SurfaceType.ISO,
                                {
                                    color: rowColorHex,
                                    opacity: surfHighOpacity,
                                },
                                surfSel,
                                SiteSel,
                            );
                        }
                    });
                }
            }
            else {
                console.log("Clicked elements exist, not showing individual residue surfaces");
            }
        }
        viewer.render();
    }

}).on('mouseout', 'tr', function () { // event listener for mouseout on table rows

    let rowId = Number(this.id);  // gets the row id of the table row that is hovered over

    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data

    let clickedElements = document.getElementsByClassName("clicked-row");

    if (clickedElements.length == 0) {

        if (clickedBindingRess.includes(rowId)) { // if the binding site residue is clicked, we do not reset the style
            //
        }
        else {
            resetChartStyles(newChart, index, "black", 2, 8); // resets chart styles to default
        }

        //let PDBResNum = Up2PdbDict[repPdbId][labelAsymId][rowId];

        if (activeModel == "superposition") {
            if (clickedBindingRess.length == 0) { // no binding site residues are clicked
                viewer.setStyle(
                    {...protAtoms, model: protAtomsModel},
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff}}
                );
            }
            else {
                let clickedBindingRessSel = clickedBindingRess.map(res => Up2PdbDict[repPdbId][labelAsymId][res]);
                viewer.setStyle(
                    {...protAtoms, model: protAtomsModel, not: {resi: clickedBindingRessSel}},
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff}}
                );
            }
        }
        else {
            if (contactsVisible) {
                if (clickedBindingRess.length == 0) { // no binding site residues are clicked
                    viewer.setStyle(
                        {...protAtoms, model: activeModel, not: {or: allBindingRess}},
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff}}
                    );
                }
                else {
                    let AssemblyClickedResidues = []; // clear the clicked residues array
                    // clickedBindingRessSel needs to take into account all chains
                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                        //loop through clickedBindingRess
                        for (const clickedBindingRes of clickedBindingRess) {
                            let clickedPDBRes = Up2PdbMapAssembly[chainsMapAssembly[element]][clickedBindingRes];
                            if (clickedPDBRes !== undefined) {
                                let clickedResSel = {model: activeModel, resi: clickedPDBRes, chain: element, not: {atom: bboneAtoms}};
                                AssemblyClickedResidues.push(clickedResSel);
                            }
                        }
                    });
                    viewer.setStyle(
                        {...protAtoms, model: activeModel, not: {or: allBindingRess}, not: {or: AssemblyClickedResidues}},
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff}}
                    );
                }

                for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors };
                    defaultColors.C = value[2];
                    viewer.setStyle( // displaying and colouring again the ligand-interacting residues
                        {model: activeModel, or: value[0]}, // value[0] are the ligand-binding residues selection
                        {
                            cartoon:{style: cartoonStyle, color: value[2], arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                            stick:{hidden: false, colorscheme: defaultColors,}  // value[2] is colour of the binding site
                        }
                    );
                }
            }
            else {
                if (clickedBindingRess.length == 0) { // no binding site residues are clicked
                    viewer.setStyle(
                        {...protAtoms, model: activeModel},
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff}}
                    );
                }
                else {
                    let AssemblyClickedResidues = []; // clear the clicked residues array
                    // clickedBindingRessSel needs to take into account all chains
                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                        //loop through clickedBindingRess
                        for (const clickedBindingRes of clickedBindingRess) {
                            let clickedPDBRes = Up2PdbMapAssembly[chainsMapAssembly[element]][clickedBindingRes];
                            if (clickedPDBRes !== undefined) {
                                let clickedResSel = {model: activeModel, resi: clickedPDBRes, chain: element, not: {atom: bboneAtoms}};
                                AssemblyClickedResidues.push(clickedResSel);
                            }
                        }
                    });
                    viewer.setStyle(
                        {...protAtoms, model: activeModel, not: {or: AssemblyClickedResidues}},
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff}}
                    );
                }
            }
        }
        viewer.render();
    }
    else { // there is a clicked row
        if (clickedBindingRess.includes(rowId)) { // if the binding site residue is clicked, we do not reset the style
            //
        }
        else {
            resetChartStyles(newChart, index, "black", 2, 8); // resets chart styles to default
        }
    }

    if (labelsVisible) {
        for (const label of labelsHash[activeModel]["hoveredRes"]) {
            viewer.removeLabel(label);
        }
        labelsHash[activeModel]["hoveredRes"] = [];
    }
    if (surfaceVisible) {
        if (clickedElements.length == 0) { // no binding sites are clicked
            if (clickedBindingRess.includes(rowId)) {
                //
            }
            else {
                if (activeModel == "superposition") {
                    if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(rowId)) {
                        viewer.setSurfaceMaterialStyle(surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][rowId].surfid, {opacity: surfHiddenOpacity});
                    }
                    if (clickedBindingRess.length == 0) { // no binding site residues are clicked
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfLowOpacity});
                            }
                            else if (key == "single_residues") {
                                //
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfMediumOpacity});
                            }
                        }
                    }
                }
                else {
                    // loop thorugh protein chains
                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                        let ResKey = element + "_" + rowId;
                        if (surfsDict[activeModel]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                            viewer.setSurfaceMaterialStyle(surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey].surfid, {opacity: surfHiddenOpacity});
                        }
                        if (clickedBindingRess.length == 0) { // no binding site residues are clicked
                            // TODO: implement this
                            for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(value[element].surfid, {color: defaultColor, opacity: surfLowOpacity});
                            }
                            else if (key == "single_residues") {
                                //
                            }
                            else if (key == "lig_inters") {
                                // pass
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(value[element].surfid, {color: siteColor, opacity: surfMediumOpacity});
                            }
                        }
                        }
                    });
                }
            }
        }
        else {
            // do not touch surfaces if a site is clicked
        }
        viewer.render();
    }
}).on('click', 'tr', function () { // implementing new click event listener for binding site residues table rows
    let rowId = Number(this.id);  // gets the row ID of the table row that is hovered over (this corresponds to the UniProt residue number of this row)
    let index = newChartData[newChartLab].indexOf(rowId); // gets the index of the row id in the chart data
    let rowColor = window.getComputedStyle(this).getPropertyValue('color');
    let rowColorHex = rgbToHex(rowColor);

    let clickedElements = document.getElementsByClassName("clicked-row");

    if (clickedBindingRess.includes(rowId)) {
        clickedBindingRess = clickedBindingRess.filter(res => res !== rowId); // removes the row id from the clicked binding residues array
        if (index !== -1) {
            resetChartStyles(newChart, index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
        }
        clearClickedResidueRow(this); // clears the clicked residue row styles
        if (labelsVisible) {
            if (activeModel == "superposition") {
                // need to check whether the label for the clicked residue exists
                if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(rowId)) {
                    labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][rowId].hide(); // hides the label for the clicked residue
                }
            }
            else {
                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                    let ResKey = element + "_" + rowId; // key for the residue in the labels hash
                    if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                        labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].hide(); // hides the label for the clicked residue
                    }
                });
            }
        }
        viewer.render();
    }
    else {
        clickedBindingRess.push(rowId); // adds the row id to the clicked binding residues array
        if (index !== -1) {
            resetChartStyles(newChart, index, "#bfd4cb", 10, 16); // changes chart styles to highlight the clicked binding site
        }
        clearHighlightedResidueRow(this); // clears the highlighted residue row styles before applying clicked styles
        clickResiduesTableRow(this);

        if (activeModel == "superposition") { // in this case, only one residue as this is a supperposition of single chains
            if (clickedElements.length == 0){ // only do this if no binding sites are clicked
                SuppPDBResNum = Up2PdbDict[repPdbId][labelAsymId][rowId];
                if (SuppPDBResNum !== undefined) {
                    viewer.setStyle(
                        {model: protAtomsModel, chain: authAsymId, resi: SuppPDBResNum, not: {atom: bboneAtoms}},
                        {
                            cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                            stick:{color: rowColorHex},
                        }
                    );
                    if (labelsVisible) {
                        if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(rowId)) {
                            console.log(`Residue ${rowId} already clicked and label exists`);
                            labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][rowId].show();
                        }
                        else {
                            //console.log(`Residue ${rowId} not clicked yet. Creating label...`);
                            let resSel = {model: protAtomsModel, resi: SuppPDBResNum, chain: authAsymId}
                            let resName = viewer.selectedAtoms(resSel)[0].resn
                            let label = viewer.addLabel(
                                resName + String(Pdb2UpDict[repPdbId][labelAsymId][SuppPDBResNum]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: rowColorHex, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                resSel,
                                false,
                            );
                            labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][rowId] = label; // store the label in the hash
                        }
                    }
                    if (surfaceVisible) { // create new surface just for the clicked residue
                        // need to hide all other surfaces first
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == "non_binding") {
                                viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                            }
                            else if (key == "single_residues") {
                                // do nothing for these surfaces
                            }
                            else {
                                let siteColor = chartColors[Number(key.split("_").pop())];
                                viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: siteColor, opacity: surfHiddenOpacity});
                            }
                        }
                        if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(rowId)) {
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][rowId].surfid, {color: rowColorHex, opacity: surfHighOpacity});
                        }
                        else {
                            // create a new surface for the clicked residue
                            let surfSel = {model: protAtomsModel, resi: SuppPDBResNum, chain: authAsymId};
                            let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                .filter(el => Up2PdbDict[repPdbId][labelAsymId].hasOwnProperty(el))
                                .map(el => Up2PdbDict[repPdbId][labelAsymId][el]);
                            let SiteSel = {model: protAtomsModel, chain: authAsymId, resi: SitePDBResNums};
                            surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][rowId] = viewer.addSurface(
                                $3Dmol.SurfaceType.ISO,
                                {
                                    color: rowColorHex,
                                    opacity: surfHighOpacity,
                                },
                                surfSel,
                                SiteSel,
                            );
                        }
                    }
                }
                else {
                    console.log("Residue not found in structure!");
                }
            }
        }
        else {
            if (clickedElements.length == 0) { // only do this if no binding sites are clicked
                proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                    let AssemblyPDBResNum = Up2PdbMapAssembly[chainsMapAssembly[element]][rowId]
                    AssemblyPDBResNums.push([element, AssemblyPDBResNum]);
                    if (AssemblyPDBResNum !== undefined) {
                        let ResKey = element + "_" + rowId;
                        if (contactsVisible) {
                            let defaultColors = { ...$3Dmol.elementColors.defaultColors };
                            defaultColors.C = rowColorHex;
                            viewer.setStyle(
                                {model: activeModel, resi: AssemblyPDBResNum, chain: element, not: {atom: bboneAtoms}},
                                {
                                    cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                                    stick:{colorscheme: defaultColors},
                                }
                            );
                        }
                        else {
                            viewer.setStyle(
                                {model: activeModel, resi: AssemblyPDBResNum, chain: element, not: {atom: bboneAtoms}},
                                {
                                    cartoon:{style: cartoonStyle, color: rowColorHex, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness, gapcutoff: gapCutOff},
                                    stick:{color: rowColorHex},
                                }
                            );
                        }
                        if (labelsVisible) {
                            if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                console.log(`Residue ${ResKey} already clicked and label exists`);
                                labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].show();
                            }
                            else {
                                console.log(`Residue ${ResKey} not clicked yet. Creating label...`);
                                //AssemblyPDBResNums.forEach(([chain, resNum]) => {
                                    //if (resNum !== undefined) {
                                let resSel = {model: activeModel, resi: AssemblyPDBResNum, chain: element}
                                let resName = viewer.selectedAtoms(resSel)[0].resn
                                let label = viewer.addLabel(
                                    resName + String(Pdb2UpMapAssembly[chainsMapAssembly[element]][AssemblyPDBResNum]),
                                    {
                                        alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                        borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: rowColorHex, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    resSel,
                                    true,
                                );
                                labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey] = label; // store the label in the hash
                                    //}
                                //});
                            }
                        }
                        if (surfaceVisible) { // create new surface just for the clicked residue
                            // need to hide all other surfaces first
                            for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                                if (key == "non_binding") {
                                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                                        viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][element].surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                                    });
                                }
                                else if (key == "single_residues") {
                                    // do nothing for these surfaces
                                }
                                else if (key == "lig_inters") {
                                    // do nothing for these surfaces: TODO: need to check!!!
                                }
                                else {
                                    let siteColor = chartColors[Number(key.split("_").pop())];
                                    proteinChains.forEach((element) => { // in case of multiple copies of protein of interest
                                        viewer.setSurfaceMaterialStyle(surfsDict[activeModel][key][element].surfid, {color: siteColor, opacity: surfHiddenOpacity});
                                    });
                                }
                            }
                            if (surfsDict[activeModel]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                viewer.setSurfaceMaterialStyle(surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey].surfid, {color: rowColorHex, opacity: surfHighOpacity});
                            }
                            else {
                                // create a new surface for the clicked residue
                                let surfSel = {model: activeModel, resi: AssemblyPDBResNum, chain: element};
                                let surfAssemblyPDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                    .filter(el => Up2PdbMapAssembly[chainsMapAssembly[element]].hasOwnProperty(el))
                                    .map(el => Up2PdbMapAssembly[chainsMapAssembly[element]][el]);
                                let SiteSel = {model: activeModel, chain: element, resi: surfAssemblyPDBResNums};
                                surfsDict[activeModel]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                    $3Dmol.SurfaceType.ISO,
                                    {
                                        color: rowColorHex,
                                        opacity: surfHighOpacity,
                                    },
                                    surfSel,
                                    SiteSel,
                                );
                            }
                        }
                    }
                    else {
                        console.log("Residue not found in assembly!");
                    }
                });
            }
        }
        viewer.render();
    }
});

// THIS IS THE EVENT LISTENER THAT CHANGES THE AXES OF THE BINDING SITES PLOTS ACCORDING TO DROPDOWNS

document.addEventListener("DOMContentLoaded", function () {

    const xAxisTitleDropdown = document.getElementById("xAxisTitle");
    const yAxisTitleDropdown = document.getElementById("yAxisTitle");

    xAxisTitleDropdown.value = myChart.options.scales.x.title.text;
    yAxisTitleDropdown.value = myChart.options.scales.y.title.text;

    xAxisTitleDropdown.addEventListener("change", function () {
        updateChart("x", xAxisTitleDropdown, myChart, chartData, myChartLims);
    });

    yAxisTitleDropdown.addEventListener("change", function () {
        updateChart("y", yAxisTitleDropdown, myChart, chartData, myChartLims);
    });

});

// THIS IS THE EVENT LISTENER THAT CHANGES THE SIZE OF THE TABLE OF BINDING SITE RESIDUES SO ONLY TOP 5 ROWS ARE SHOWN

document.addEventListener('DOMContentLoaded', function() {
    var table = document.getElementById('bs_ress_table');
    
    // Assuming a consistent border width for all rows, we can get the border from the first row.
    var rowBorderWidth = window.getComputedStyle(table.rows[0], null).getPropertyValue('border-bottom-width');
    var firstRowHeight = window.getComputedStyle(table.rows[0], null).getPropertyValue('height');
    // Convert the border width from string (like "1px") to an integer value
    rowBorderWidth = parseFloat(rowBorderWidth, 10);
    firstRowHeight = parseFloat(firstRowHeight, 10);
    
    var numberOfRowsToShow = 6;

    // Add the border height (number of borders will be numberOfRowsToShow - 1)
    var maxHeight = (firstRowHeight * numberOfRowsToShow) + (numberOfRowsToShow - 3) * rowBorderWidth;

    table.parentElement.style.maxHeight = maxHeight + 'px';
});

// THIS IS THE EVENT LISTENER THAT CHANGES THE SIZE OF THE TABLE OF BINDING SITEs SO ONLY TOP 5 ROWS ARE SHOWN

document.addEventListener('DOMContentLoaded', function() {
    var table = document.getElementById('bss_table');
    
    // Assuming a consistent border width for all rows, we can get the border from the first row.
    var rowBorderWidth = window.getComputedStyle(table.rows[0], null).getPropertyValue('border-bottom-width');
    var firstRowHeight = window.getComputedStyle(table.rows[0], null).getPropertyValue('height');
    // Convert the border width from string (like "1px") to an integer value
    rowBorderWidth = parseFloat(rowBorderWidth, 10);
    firstRowHeight = parseFloat(firstRowHeight, 10);
    
    var numberOfRowsToShow = 5;

    // Add the border height (number of borders will be numberOfRowsToShow - 1)
    var maxHeight = (firstRowHeight * numberOfRowsToShow) + (numberOfRowsToShow - 3) * rowBorderWidth;

    table.parentElement.style.maxHeight = maxHeight + 'px';
});

function rgbToHex(rgb) {
    const rgbValues = rgb.match(/^rgba?[\s+]?[(]?(\d+)[,\s]+(\d+)[,\s]+(\d+)[,\s/]*(?:[\d+.]*)?[)]?$/i);

    if (!rgbValues) {
      return null;  // not an rgb or rgba string
    }

    let r = parseInt(rgbValues[1], 10).toString(16);
    let g = parseInt(rgbValues[2], 10).toString(16);
    let b = parseInt(rgbValues[3], 10).toString(16);

    r = r.length === 1 ? "0" + r : r;
    g = g.length === 1 ? "0" + g : g;
    b = b.length === 1 ? "0" + b : b;

    return "#" + r + g + b;
}
