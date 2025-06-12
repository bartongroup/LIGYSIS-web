var lastHoveredPoint1 = null;
var newLastHoveredPoint = null;

let siteAssemblyPDBResNumsClicked;

let siteSuppPDBResNumsClicked;

const ResiduesTable = document.getElementById('bs_ress_table');

document.getElementById('chartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas

    siteAssemblyPDBResNums = [];
    siteSuppPDBResNums = [];

    SuppHoveredSiteResidues = null;
    AssemblyHoveredSiteResidues = [];

    var chartElement = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor

    let clickedElements = document.getElementsByClassName("clicked-row"); // get all clicked rows (there should only be one)
    
    if (chartElement.length > 0) { // cursor is hovering over a data point

        let firstPoint = chartElement[0];

        if (lastHoveredPoint1 !== firstPoint.index) { // Check if the hovered point has changed

            let pointLabel = chartData[chartLab][firstPoint.index];

            let previousPointLabel = chartData[chartLab][lastHoveredPoint1];

            let siteColor = chartColors[Number(pointLabel)];

            let previousSiteColor = chartColors[Number(previousPointLabel)];

            resetChartStyles(myChart, firstPoint.index, "#ffff99", 10, 16); // changes chart styles to highlight the binding site

            if (clickedElements.length > 0) { // a row is clicked
                
                let clickedElement = clickedElements[0]; // clicked row

                siteAssemblyPDBResNumsClicked = [];
                
                clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site row

                let clickedSiteColor = chartColors[Number(clickedPointLabel)]; // color of the clicked binding site

                if (activeModel == "superposition") {
                    viewer.setStyle(// colour everything white except for clicked site. To make disappear before hovering on other site (can happen when two sites are close in the graph)
                        {...protAtoms, model: protAtomsModel, not: SuppClickedSiteResidues},
                        {
                            cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick: {color: defaultColor, hidden: true},
                        }
                    );     
                }
                else  {
                    if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                        viewer.setStyle(
                            {...protAtoms, model: activeModel, not: {or: AssemblyClickedSiteResidues.concat(allBindingRess)},},
                            {
                                cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick: {color: defaultColor, hidden: true},
                            }
                        );
                    }
                    else {
                        viewer.setStyle(// colour everything white except for clicked site. To make disappear before hovering on other site (can happen when two sites are close in the graph)
                            {...protAtoms, model: activeModel, not: {or: AssemblyClickedSiteResidues},},
                            {
                                cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick: {color: defaultColor, hidden: true},
                            }
                        );
                    }
                }
                    
                if (surfaceVisible) {
                    if (activeModel == "superposition") {
                        if (pointLabel == clickedPointLabel) {
                            // no need to show surface
                        }
                        else {
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"][pointLabel].surfid, {color: siteColor, opacity: surfMediumOpacity}); // hide surface of the hovered binding site row
                        }
                        // for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        //     if (key == pointLabel) {
                        //         viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfMediumOpacity}); // show surface of hovered site visible at 80% opacity
                        //     }
                        //     else if (key == clickedPointLabel) {
                        //         viewer.setSurfaceMaterialStyle(value.surfid, {color: clickedSiteColor, opacity: surfHighOpacity}); // keep surface of clicked table row site visible at 90% opacity
                        //     }
                        //     else {
                        //         viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfHiddenOpacity}); // hide all other surfaces
                        //     }
                        // }
                    }
                    else {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == pointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfMediumOpacity}); // show surface of hovered site visible at 80% opacity
                                }
                                else if (key == clickedPointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: clickedSiteColor, opacity: surfHighOpacity}); // keep surface of clicked table row site visible at 90% opacity
                                }
                                else if (key == "lig_inters") {
                                    if (contactsVisible) {
                                        // pass
                                    }
                                }
                                else {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity}); // hide all other surfaces
                                }
                            }
                        }
                    }
                }
            }
            else { // no row is clicked
                if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                    viewer.setStyle(
                        {...protAtoms, model: activeModel, not:{or:allBindingRess}},
                        {cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},}
                    );   
                }
                else {
                    if (clickedBindingRess.length == 0) {
                        viewer.setStyle(
                            protAtoms,
                            {cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},}
                        );
                    }
                    else {
                        let clickedBindingRessSel = [];
                        for (const bindingRes of clickedBindingRess) {
                            let bindingResPDBResNum = Up2PdbDict[bindingRes];
                            for (const [chain, resi] of bindingResPDBResNum) {
                                clickedBindingRessSel.push({model: protAtomsModel, chain: chain, resi: resi});
                            }
                        }
                        viewer.setStyle(
                            {...protAtoms, model: protAtomsModel, not: {or: clickedBindingRessSel}},
                            {cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},}
                        );
                    }
                }
                if (surfaceVisible) { // if surface is visible
                    if (activeModel == "superposition") {
                        if (clickedBindingRess.length > 0) { // if binding residues are clicked, hide all their surfaces
                            let commonRess = clickedBindingRess.filter(res => seg_ress_dict[pointLabel].includes(res)); // find common residues between clicked binding residues and hovered binding site
                            if (commonRess.length > 0) { // if there are common residues, show their surfaces
                                for (const commonRes of commonRess) {
                                    let commonResPDBResNum = Up2PdbDict[commonRes];
                                    for (const [chain, resi] of commonResPDBResNum) {
                                        let ResKey = chain + "_" + resi; // create a key for the common residue
                                        if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) { // check if the surface for the common residue exists
                                            var surfObject = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey];
                                            var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                                            viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHiddenOpacity}); // change the surface color of the hovered binding site row
                                        }
                                    }
                                }
                            }
                        }
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == pointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: siteColor, opacity: surfHighOpacity}); // change the surface color of the hovered binding site row
                            }
                            // else if (key == previousPointLabel) {
                            //     viewer.setSurfaceMaterialStyle(value.surfid, {color: previousSiteColor, opacity: surfMediumOpacity}); // change the surface color of the previously hovered binding site row
                            // }
                        }
                    }
                    else {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == pointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfHighOpacity}); // change the surface color of the hovered binding site row
                                }
                                else if (key == previousPointLabel) {
                                    if (contactsVisible) {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {opacity: surfHiddenOpacity}); // change the surface color of the hovered binding site row
                                    }
                                    else {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: previousSiteColor, opacity: surfMediumOpacity}); // change the surface color of the previously hovered binding site row
                                    }
                                }
                            }
                        }
                    }
                }
            }

            highlightTableRow(pointLabel);

            if (activeModel == "superposition") {
                siteSuppPDBResNums = seg_ress_dict[pointLabel]
                    .filter(el => Up2PdbDict.hasOwnProperty(el))
                    .flatMap(el => {
                        let dataArray = Up2PdbDict[el]; // Get the array of tuples
                        return dataArray.map(data => {
                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                        });
                    });

                SuppHoveredSiteResidues = {model: protAtomsModel, or: siteSuppPDBResNums, not: {atom: bboneAtoms}}

                viewer.setStyle(
                    SuppHoveredSiteResidues,
                    {
                        cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: siteColor,},
                    }
                );
            }
            else {

                siteAssemblyPDBResNum = seg_ress_dict[pointLabel]
                    .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                    .flatMap(el => {
                        let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                        return dataArray.map(data => {
                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                        });
                    });
                siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}
                if (contactsVisible) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                    defaultColors.C = siteColor;
                    viewer.setStyle(
                        {model: activeModel, or: siteAssemblyPDBResNums, not: {atom: bboneAtoms}},
                        {
                            cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{colorscheme: defaultColors,},
                        }
                    );
                }
                else {
                    viewer.setStyle(
                        {model: activeModel, or: siteAssemblyPDBResNums, not: {atom: bboneAtoms}},
                        {
                            cartoon:{style: cartoonStyle, color: siteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: siteColor},
                        }
                    );
                }
            }
            viewer.render();       
            
            // clearHighlightedRow();

            lastHoveredPoint1 = firstPoint.index;
        }
    }
    else if (lastHoveredPoint1 !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)

        if (clickedElements.length > 0) { // a row is clicked

            let clickedElement = clickedElements[0]; // clicked row
            
            clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site row

            let clickedSiteColor = chartColors[Number(clickedPointLabel)]; // color of the clicked binding site

            if (activeModel == "superposition") {

                viewer.setStyle(
                    {
                        ...protAtoms, model: protAtomsModel, not: SuppClickedSiteResidues, // all protein residues except clicked site (we want to keep ligands),
                    },
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                );

                viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                    SuppClickedSiteResidues,
                    {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                    stick:{color: clickedSiteColor,}, }
                );
                // colour again clicked residuesAdd commentMore actions
                if (!clickedBindingRess.length == 0) {
                    let clickedBindingRessSel = [];
                    let displayedSiteColour = chartColors[Number(CurrentDisplayedSite)]; // colour of the clicked binding site
                    for (const bindingRes of clickedBindingRess) {
                        let bindingResPDBResNum = Up2PdbDict[bindingRes];
                        for (const [chain, resi] of bindingResPDBResNum) {
                            clickedBindingRessSel.push({model: protAtomsModel, chain: chain, resi: resi});
                        }
                    }
                    viewer.setStyle(
                        {...protAtoms, model: protAtomsModel, or: clickedBindingRessSel, not: {atom: bboneAtoms}},
                        {cartoon: {style: cartoonStyle, color: displayedSiteColour, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick: {color: displayedSiteColour},}
                    );  
                }
            }
            else {
                    viewer.setStyle(
                        {
                           ...protAtoms, model: activeModel, not: {or: AssemblyClickedSiteResidues}, // all protein residues except clicked site (we want to keep ligands)
                        },
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );
                if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                    defaultColors.C = clickedSiteColor;
                    viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                        {model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}},
                        {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{colorscheme: defaultColors,}, }
                    );
                    viewer.setStyle(
                        {
                            ...protAtoms, model: activeModel, not: {or: AssemblyClickedSiteResidues.concat(allBindingRess)} // all protein residues except clicked site (we want to keep ligands)
                        },
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );
                    for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) { // colour again in case some bingind residues are part of another site and got colouterd
                        let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                        defaultColors.C = value[2];
                        viewer.setStyle(
                            {model: activeModel, or: value[0]},  // value[0] are the ligand-binding residues selection
                            {
                                cartoon:{style: cartoonStyle, color: value[2], arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{hidden: false, colorscheme: defaultColors,} // value[2] is colour of the binding site
                            }
                        );
                    }
                }
                else {
                    viewer.setStyle( // colouring the clicked site (necessary as sometimes there is overlap between sites)
                        {model: activeModel, or: AssemblyClickedSiteResidues, not: {atom: bboneAtoms}},
                        {cartoon:{style: cartoonStyle, color: clickedSiteColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: clickedSiteColor,}, }
                    );
                }
            }
            if (surfaceVisible) { // if surface is visible (when hovering on a site on the chart and a row is clicked)
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == clickedPointLabel) { 
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: clickedSiteColor, opacity: surfHighOpacity}); // keep surface of clicked site visible at 90% opacity
                        }
                        else {
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"][key].surfid, {color: defaultColor, opacity: surfHiddenOpacity}); // hide all other surfaces
                        }
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        for (const [key2, value2] of Object.entries(value)) {
                            if (key == clickedPointLabel) {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: clickedSiteColor, opacity: surfHighOpacity}); // keep surface of clicked site visible at 90% opacity
                            }
                            else if (key == "lig_inters") {
                                if (contactsVisible) {
                                    // pass
                                }
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity}); // hide all other surfaces
                            }
                        }
                    }
                }
            }
            resetChartStyles(myChart, clickedPointLabel, "#bfd4cb", 10, 16); // changes chart styles to highlight the newly clicked site
        }
        else { // no row is clicked

            if (contactsVisible) { // don't want to hide ligand-binding sites if CONTACTS is ON
                viewer.setStyle(
                    {...protAtoms, model: activeModel, not:{or: allBindingRess}},
                    {cartoon:{style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},}
                );
                // also recolour the ligand-interacting residues as some might be in multiple sites
                for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                    defaultColors.C = value[2];
                    viewer.setStyle(
                        {model: activeModel, or: value[0]}, // value[0] are the ligand-binding residues selection
                        {
                            cartoon:{style: cartoonStyle, color: value[2], arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{hidden: false, colorscheme: defaultColors,} // value[2] is colour of the binding site
                        }
                    );
                }
            }
            else {
                viewer.setStyle( // this generic selection works are CONTACTS are OFF and no row is clicked
                    protAtoms,
                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                ); // remove sidechains and colour white everything except ligands (all protein atoms)

                // colour again clicked residues
                if (!clickedBindingRess.length == 0) {
                    let clickedBindingRessSel = [];
                    let displayedSiteColour = chartColors[Number(CurrentDisplayedSite)]; // colour of the clicked binding site
                    for (const bindingRes of clickedBindingRess) {
                        let bindingResPDBResNum = Up2PdbDict[bindingRes];
                        for (const [chain, resi] of bindingResPDBResNum) {
                            clickedBindingRessSel.push({model: protAtomsModel, chain: chain, resi: resi});
                        }
                    }
                    viewer.setStyle(
                        {...protAtoms, model: protAtomsModel, or: clickedBindingRessSel, not: {atom: bboneAtoms}},
                        {cartoon: {style: cartoonStyle, color: displayedSiteColour, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick: {color: displayedSiteColour},}
                    );
                }
            }

            if (surfaceVisible) { // if surface is visible
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
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
                        else { // if binding residues are clicked, hide the un-hovered site surface (clicked residue surfaces will remain)
                            //show surfaces of all clicked binding residues. loop through clickedBindingRess
                            for (const bindingRes of clickedBindingRess) {
                                let bindingResPDBResNum = Up2PdbDict[bindingRes];
                                if (bindingResPDBResNum !== undefined) { // check if bindingResPDBResNum is defined
                                    for (const [chain, resi] of bindingResPDBResNum) {
                                        let ResKey = chain + "_" + resi; // create a key for the clicked residue
                                        if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) { // check if the surface for the clicked residue exists
                                            var surfObject = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey];
                                            var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                                            viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHighOpacity}); // change the surface color of the hovered binding site row
                                        }
                                        else { // residues were clicked on a site as clicked, so surfaces do not exist
                                            let surfSel = {model: protAtomsModel, chain: chain, resi: resi};
                                            let SitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                                .filter(el => Up2PdbDict.hasOwnProperty(el))
                                                .flatMap(el => {
                                                    let dataArray = Up2PdbDict[el]; // Get the array of tuples
                                                    return dataArray.map(data => {
                                                        return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                                    });
                                                }
                                            );
                                            let SiteSel = {model: protAtomsModel, or: SitePDBResNums}; // selection of the site residues
                                            surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                                $3Dmol.SurfaceType.ISO,
                                                {
                                                    color: currentSiteColor,
                                                    opacity: surfHighOpacity,
                                                },
                                                surfSel,
                                                SiteSel
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                    viewer.setSurfaceMaterialStyle(surfsDict["superposition"][lastHoveredPoint1].surfid, {opacity: surfHiddenOpacity});
                }
                else {
                    if (contactsVisible) {
                        for (const [key, value] of Object.entries(surfsDict[activeModel][lastHoveredPoint1])) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {opacity: surfHiddenOpacity});
                        }
                    }
                    else {
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == "lig_inters") { // do nothing for these surfaces
                                    // pass
                                }
                                else if (key == "non_binding") {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfLowOpacity});
                                }
                                else {
                                    let siteColor = chartColors[Number(key.split("_").pop())];
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfMediumOpacity});
                                }
                            }
                        }
                    }
                }
            }
        }
        
        viewer.render();

        lastHoveredPoint1 = null;

        clearHighlightedRow();
    }
});

document.getElementById('chartCanvas').addEventListener('click', function(e) { // when the cursor clicks over the chart canvas

    siteAssemblyPDBResNumsClicked = [];

    siteAssemblyPDBResNums = [];

    var chartElement = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor
    
    if (chartElement.length > 0) { // cursor is hovering over a data point
        
        let firstPoint = chartElement[0];

        let index = firstPoint.index; // index of the clicked data point

        let pointLabel = chartData[chartLab][index]; // label of the clicked data point

        let pointColor = chartColors[index]; // color of the clicked data point

        let fullPointLabel = jobId + "_" + pointLabel;

        let previouslyDisplayedSite = CurrentDisplayedSite; // store the previously clicked site before changing it

        CurrentDisplayedSite = pointLabel; // assigning new value to CurrentDisplayedSite so that we keep track of which site is displayed. Necessary to remove labels when another site is clickedAdd commentMore actions
        if (labelsHash[activeModel]["clickedResidues"].hasOwnProperty(pointLabel)) {
            //
        }
        else {
            labelsHash[activeModel]["clickedResidues"][pointLabel] = {}; // create an empty array for clicked residues if it doesn't exist
        }
        if (surfsDict["superposition"]["single_residues"].hasOwnProperty(pointLabel)) {
            //
        }
        else {
            surfsDict["superposition"]["single_residues"][pointLabel] = {}; // create an empty object for clicked residues if it doesn't exist
        }

        if (previouslyDisplayedSite == pointLabel) {
            //
        }
        else {
            $.ajax({ // AJAX request to get the table data from the server
                type: 'POST', // POST request
                url: `${window.appBaseUrl}/user-get-table`, // URL to send the request to
                contentType: 'application/json;charset=UTF-8', // content type
                // data to send in the body of the request
                data: JSON.stringify({
                    'label': fullPointLabel,
                    'session_id': session_id,
                    'submission_time': submission_time,
                }),
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
                        newRow[0].style.setProperty('color', pointColor, "important");
                        newRow[0].style.setProperty('--bs-table-color', pointColor);
                        newRow[0].style.setProperty('--bs-table-hover-color', pointColor);
                        tableBody.append(newRow); // Append the new row to the table body
                    }

                    newChartData = response;
                    newChart.data.datasets[0].data = newChartData[newChartY];  // New data
                    newChart.data.datasets[0].backgroundColor = pointColor;
                    newChart.data.datasets[0].pointHoverBackgroundColor = pointColor;
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

        // I want to replace the binding site of the clicked row when a data point on this chart is clicked on

        let clickedElements = document.getElementsByClassName("clicked-row");

        if (clickedElements.length > 0) { // a site is clicked

            let clickedElement = clickedElements[0]; // clicked site
                
            clickedPointLabel = chartData[chartLab][clickedElement.id]; // label of the clicked binding site point

            clearClickedRows(); // clear the already clicked table row

            resetChartStyles(myChart, clickedPointLabel, "black", 1, 12); // changes chart styles to default for the previously clicked site  

            if (labelsVisible) { // hide labels of the previously clicked site
                for (label of labelsHash[activeModel]["clickedSite"][clickedSite]) {
                    label.hide();
                }
                // since residues were clicked when site was clicked, single residue labels do not exist and need to be created
                if (clickedBindingRess.length > 0) {
                    for (const res of clickedBindingRess) {
                        let resPDBResNum = Up2PdbDict[res];
                        if (resPDBResNum !== undefined) { // check if resPDBResNum is defined
                            for (const [chain, resi] of resPDBResNum) {
                                let ResKey = chain + "_" + resi; // create a key for the clicked residue
                                if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                    labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].show();
                                }
                                else {
                                    let resSel = {model: protAtomsModel, resi: resi, chain: chain}
                                    let resName = viewer.selectedAtoms(resSel)[0].resn
                                    let label = viewer.addLabel(
                                        resName + String(Pdb2UpDict[chain][resi]),
                                        {
                                            alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                            borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                            font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                            inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                        },
                                        resSel,
                                        false,
                                    );
                                    labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey] = label;
                                }
                            }
                        }
                    }
                }
            }

            // check is clicked row is the same as the newly clicked data point

            if (clickedPointLabel == pointLabel) { // same binding site is clicked

                if (surfaceVisible) { // here if surface is active: go back to show surfaces as by default
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
                            // hide clicked residue surfacesAdd commentMore actions
                            for (const clickedRes of clickedBindingRess) {
                                let clickedResPDBResNum = Up2PdbDict[clickedRes];
                                if (clickedResPDBResNum !== undefined) { // check if clickedResPDBResNum is defined
                                    for (const [chain, resi] of clickedResPDBResNum) {
                                        let ResKey = chain + "_" + resi; // create a key for the clicked residue
                                        if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) { // check if the surface for the clicked residue exists
                                            var surfObject = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey];
                                            var currentSiteColor = chartColors[Number(CurrentDisplayedSite)];
                                            viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: currentSiteColor, opacity: surfHiddenOpacity}); // change the surface color of the hovered binding site row
                                        }
                                    }
                                }
                            }
                            // show surface of just unclicked siteAdd commentMore actions
                            viewer.setSurfaceMaterialStyle(surfsDict["superposition"][pointLabel].surfid, {color: pointColor, opacity: surfHighOpacity});
                        }
                    }
                    else{
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (contactsVisible) {
                                    if (key == "lig_inters") { // sho
                                        // pass
                                    }
                                    else { // hide other surfaces
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                                    }
                                }
                                else {
                                    if (key == "lig_inters") {
                                        // pass
                                    }
                                    else if (key == "non_binding") {
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfLowOpacity});
                                    }
                                    else {
                                        let siteColor = chartColors[Number(key.split("_").pop())];
                                        viewer.setSurfaceMaterialStyle(value2.surfid, {color: siteColor, opacity: surfMediumOpacity});
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

                SuppClickedSiteResidues = null; // reset clicked site residues
                AssemblyClickedSiteResidues = [];  // reset clicked site residues

                clickedPointLabel = null; // reset clickedPointLabel
                clickedSite = null; // reset clickedSite
            }

            else {
                if (activeModel == "superposition") {
                    viewer.setStyle( // colour white previously clicked site residues
                            SuppClickedSiteResidues,
                            {
                                cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}
                            }
                        );
                }
                else {
                    viewer.setStyle(
                        {model: activeModel, or: AssemblyClickedSiteResidues},
                        {
                            cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}
                        }
                    );
                }

                clickTableTowById(pointLabel) // click the table row of the newly clicked data point

                clickedSite = index; // set clicked site to the newly clicked data point

                resetChartStyles(myChart, pointLabel, "#bfd4cb", 10, 16); // changes chart styles to highlight the newly clicked site

                SuppClickedSiteResidues = null; // reset clicked site residues
                AssemblyClickedSiteResidues = [];  // reset clicked site residues 

                if (activeModel == "superposition") {
                    siteSuppPDBResNums = seg_ress_dict[index]
                        .filter(el => Up2PdbDict.hasOwnProperty(el))
                        .flatMap(el => {
                            let dataArray = Up2PdbDict[el]; // Get the array of tuples
                            return dataArray.map(data => {
                                return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                            });
                        });
                    
                    SuppClickedSiteResidues = {model: protAtomsModel, or: siteSuppPDBResNums, not: {atom: bboneAtoms}};

                    viewer.setStyle(
                        SuppClickedSiteResidues,
                        {
                            cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: pointColor},
                        },
                    );
                    viewer.zoomTo(SuppClickedSiteResidues);
                }
                else {

                    let siteAssemblyPDBResNum = seg_ress_dict[index]
                        .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                        .flatMap(el => {
                            let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                            return dataArray.map(data => {
                                return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                            });
                        });
                    siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}
                    AssemblyClickedSiteResidues = siteAssemblyPDBResNums;  
                    
                    if (contactsVisible) {
                        let defaultColors = { ...$3Dmol.elementColors.defaultColors }; 
                        defaultColors.C = pointColor;
                        viewer.setStyle(
                            {model: activeModel, or: siteAssemblyPDBResNums, not: {atom: bboneAtoms}},
                            {
                                cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{colorscheme: defaultColors},
                            },
                        );
                    }
                    else {
                        viewer.setStyle(
                            {model: activeModel, or: siteAssemblyPDBResNums, not: {atom: bboneAtoms}},
                            {
                                cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{color: pointColor},
                            },
                        );
                    }
                    viewer.zoomTo({model: activeModel, or: siteAssemblyPDBResNums});
                }
                if (labelsVisible) {
                    if (labelsHash[activeModel]["clickedSite"].hasOwnProperty(index)) {
                        console.log(`Site ${index} already clicked and labels exist`);
                        for (const label of labelsHash[activeModel]["clickedSite"][index]) {
                            label.show();
                        }
                    }
                    else {
                        labelsHash[activeModel]["clickedSite"][index] = [];
                        if (activeModel == "superposition") {
                            for (siteSuppPDBResNum of siteSuppPDBResNums) {
                                let resChain = siteSuppPDBResNum['chain'];
                                let resNum = siteSuppPDBResNum['resi'];
                                let resSel = {model: protAtomsModel, resi: resNum, chain: resChain}
                                let resName = viewer.selectedAtoms(resSel)[0].resn
                                let label = viewer.addLabel(
                                    resName + String(Pdb2UpDict[resChain][resNum]),
                                    {
                                        alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                        borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                                    false,
                                );
                                labelsHash[activeModel]["clickedSite"][index].push(label);
                            }
                        }
                        else {
                            for (residue of siteAssemblyPDBResNums) {
                                let resChain = residue['chain'];
                                let resNum = residue['resi'];
                                let resSel = {model: activeModel, resi: resNum, chain: resChain}
                                let resName = viewer.selectedAtoms(resSel)[0].resn
                                let label = viewer.addLabel(
                                    resName + String(Pdb2UpMapAssembly[resChain][resNum]),
                                    {
                                        alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                        borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    {model: activeModel, resi: resNum, chain: resChain, atom: 'CA'},
                                    false,
                                );
                                labelsHash[activeModel]["clickedSite"][index].push(label);
                            }
                        }
                    }
                }
                if (surfaceVisible) { // hide other surfaces and show clicked one
                    if (activeModel == "superposition") {
                        for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                            if (key == pointLabel) {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: pointColor, opacity: surfHighOpacity});
                            }
                            else {
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                            }
                        }
                    }
                    else{
                        for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == "lig_inters") {
                                    // pass
                                }
                                else if (key == pointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: pointColor, opacity: surfHighOpacity});
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
        else { // no row is clicked (at this point the variables should always be null and [])

            clickTableTowById(pointLabel) // click the table row of the newly clicked data point
            clickedSite = index; // set clicked site to the newly clicked data point

            resetChartStyles(myChart, pointLabel, "#bfd4cb", 10, 16); // changes chart styles to highlight the newly clicked site

            if (activeModel == "superposition") {
                siteSuppPDBResNums = seg_ress_dict[index]
                        .filter(el => Up2PdbDict.hasOwnProperty(el))
                        .flatMap(el => {
                            let dataArray = Up2PdbDict[el]; // Get the array of tuples
                            return dataArray.map(data => {
                                return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                            });
                        });
                    
                SuppClickedSiteResidues = {model: protAtomsModel, or: siteSuppPDBResNums, not: {atom: bboneAtoms}};

                viewer.setStyle(
                    SuppClickedSiteResidues,
                    {
                        cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                        stick:{color: pointColor},
                    },
                );

                if (pointLabel != previouslyDisplayedSite) { // if clicked site is different from previously displayed site, remove labels of previously displayed site
                    if (clickedBindingRess.length > 0) {
                        let clickedBindingRessSel = [];
                        for (const res of clickedBindingRess) {
                            let resPDBResNum = Up2PdbDict[res];
                            if (resPDBResNum !== undefined) { // check if resPDBResNum is defined
                                for (const [chain, resi] of resPDBResNum) {
                                    let ResKey = chain + "_" + resi; // create a key for the clicked residue
                                    clickedBindingRessSel.push({model: protAtomsModel, chain: chain, resi: resi});
                                    if (surfaceVisible) {
                                        if (surfsDict["superposition"]["single_residues"][previouslyDisplayedSite].hasOwnProperty(ResKey)) {
                                            var surfObject = surfsDict["superposition"]["single_residues"][previouslyDisplayedSite][ResKey];
                                            var previousSiteColor = chartColors[Number(previouslyDisplayedSite)];
                                            viewer.setSurfaceMaterialStyle(surfObject.surfid, {color: previousSiteColor, opacity: surfHiddenOpacity});
                                        }
                                    }
                                }
                                viewer.setStyle(
                                    {...protAtoms, model: protAtomsModel, or: clickedBindingRessSel},
                                    {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                    stick: {color: defaultColor, hidden: true},}
                                );
                            }
                        }
                        clickedBindingRess = []; // clear clicked binding residues, since we are in a new site
                    }
                }

                viewer.zoomTo(SuppClickedSiteResidues);
            }
    
            else {
                let siteAssemblyPDBResNum = seg_ress_dict[index]
                    .filter(el => Up2PdbMapAssembly.hasOwnProperty(el))
                    .flatMap(el => {
                        let dataArray = Up2PdbMapAssembly[el]; // Get the array of tuples
                        return dataArray.map(data => {
                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                        });
                    });
                siteAssemblyPDBResNums = siteAssemblyPDBResNum // this is now an array of dictionaries: {chain: chain, resi: resi}
                AssemblyClickedSiteResidues = siteAssemblyPDBResNums;
                
                if (contactsVisible) {
                    let defaultColors = { ...$3Dmol.elementColors.defaultColors };
                    defaultColors.C = pointColor;
                    viewer.setStyle(
                        {model: activeModel, or: siteAssemblyPDBResNums, not: {atom: bboneAtoms}},
                        {
                            cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{colorscheme: defaultColors},
                        },
                    );
                }
                else {
                    viewer.setStyle(
                        {model: activeModel, or: siteAssemblyPDBResNums, not: {atom: bboneAtoms}},
                        {
                            cartoon: {style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                            stick:{color: pointColor},
                        },
                    );
                }
                
                viewer.zoomTo({model: activeModel, or: siteAssemblyPDBResNums});
            }

            if (labelsVisible) {
                if (pointLabel == previouslyDisplayedSite) {
                    // if clicked site is the same as displayed site (on residues table), don't need to remove labels
                }
                else {
                    for (const [key, label] of Object.entries(labelsHash[activeModel]["clickedResidues"][previouslyDisplayedSite])) {
                        label.hide();
                    }
                }
                if (labelsHash[activeModel]["clickedSite"].hasOwnProperty(index)) {
                    console.log(`Site ${index} already clicked and labels exist`);
                    for (const label of labelsHash[activeModel]["clickedSite"][index]) {
                        label.show();
                    }
                }
                else {
                    labelsHash[activeModel]["clickedSite"][index] = [];
                    if (activeModel == "superposition") {
                        for (siteSuppPDBResNum of siteSuppPDBResNums) {
                            let resChain = siteSuppPDBResNum['chain'];
                            let resNum = siteSuppPDBResNum['resi'];
                            let resSel = {model: protAtomsModel, resi: resNum, chain: resChain}
                            let resName = viewer.selectedAtoms(resSel)[0].resn
                            let label = viewer.addLabel(
                            resName + String(Pdb2UpDict[resChain][resNum]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                                false,
                            );
                            labelsHash[activeModel]["clickedSite"][index].push(label);
                        }
                    }
                    else {
                        for (let residue of siteAssemblyPDBResNums) {
                            let resChain = residue['chain'];
                            let resNum = residue['resi'];
                            let resSel = {model: activeModel, resi: resNum, chain: resChain}
                            let resName = viewer.selectedAtoms(resSel)[0].resn
                            let label = viewer.addLabel(
                                resName + String(Pdb2UpMapAssembly[resChain][resNum]),
                                {
                                    alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                    borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                    font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                    inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                },
                                {model: activeModel, resi: resNum, chain: resChain, atom: 'CA'},
                                false,
                            );
                            labelsHash[activeModel]["clickedSite"][index].push(label);
                            
                        }
                    }
                }
            }

            if (surfaceVisible) { // hide other surfaces and show clicked one
                if (activeModel == "superposition") {
                    for (const [key, value] of Object.entries(surfsDict["superposition"])) {
                        if (key == pointLabel) {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: pointColor, opacity: surfHighOpacity});
                        }
                        else {
                            viewer.setSurfaceMaterialStyle(value.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                        }
                    }
                }
                else {
                    for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                        if (key == "lig_inters") {
                            // pass
                        }
                        else {
                            for (const [key2, value2] of Object.entries(value)) {
                                if (key == pointLabel) {
                                    viewer.setSurfaceMaterialStyle(value2.surfid, {color: pointColor, opacity: surfHighOpacity});
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
    }
});

document.getElementById('newChartCanvas').addEventListener('mousemove', function(e) { // when the cursor moves over the chart canvas

    var newChartElement = newChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursor

    let clickedElements = document.getElementsByClassName("clicked-row");

    AssemblyPDBResNums = [];
    
    if (newChartElement.length > 0) { // cursor is hovering over a data point

        let newFirstPoint = newChartElement[0];
        
        const pointColor = newChart.data.datasets[0].backgroundColor;

        if (newLastHoveredPoint !== newFirstPoint.index) { // Check if the hovered point has changed

            newLastHoveredPoint = newFirstPoint.index;

            let newPointLabel = newChartData[newChartLab][newFirstPoint.index];

            clearHighlightedRow(); // clear the previously highlighted row

            highlightTableRow(newPointLabel); // highlight the row of the newly hovered data point

            if (clickedElements.length == 0) { // no binding site row is clicked

                if (activeModel == "superposition") { // in this case, only one residue as this is a supperposition of single chains
                    // don't want to hide clicked residues hereAdd commentMore actions
                    if (clickedBindingRess.length > 0) { // if there are clicked binding residues, hide them
                        let clickedBindingRessSel = []
                        for (const clickedBindingRes of clickedBindingRess) {
                            let dataArray = Up2PdbDict[clickedBindingRes]; // Get the array of tuples
                            clickedBindingRessSel.push(...dataArray.map(data => {
                                return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                            }));
                        }
                        viewer.setStyle(
                            {...protAtoms, model: protAtomsModel, not: {or: clickedBindingRessSel}},
                            {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                        );
                    }
                    else {
                        viewer.setStyle( // CONTINUE HERE!
                            {...protAtoms, model: protAtomsModel},
                            {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                        ); // this is done so only a single point is highlighted when hovered on (some are really close.)
                    }
                    SuppPDBResNum = Up2PdbDict[newPointLabel]; // this is now an array (anticipating multimeric structures)
                    let SuppPDBResNumSel = SuppPDBResNum.map(tuple => {
                        return { chain: tuple[0], resi: tuple[1] };
                    });
                    
                    if (SuppPDBResNum != undefined) {
                        viewer.setStyle(
                            {model: protAtomsModel, or: SuppPDBResNumSel, not: {atom: bboneAtoms}},
                            {
                                cartoon:{style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{color: pointColor},
                            }
                        );
                    }
                    else {
                        console.log(`Residue ${newPointLabel} not found in the structure!`);
                    }
                }
                else {
                    if (contactsVisible) {
                        viewer.setStyle(
                            {...protAtoms, model: activeModel, not: {or: allBindingRess}},
                            {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                        );
                    }
                    else {
                        viewer.setStyle(
                            {...protAtoms, model: activeModel},
                            {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                        );
                    }
                    let AssemblyPDBResNum = Up2PdbMapAssembly[newPointLabel]
                    if (AssemblyPDBResNum  != undefined) {
                        let AssemblyPDBResNumSel = AssemblyPDBResNum.map(tuple => {
                            return { chain: tuple[0], resi: tuple[1] };
                        });
                        //AssemblyPDBResNums.push([element, AssemblyPDBResNum]);
                        AssemblyPDBResNums = AssemblyPDBResNumSel;
                        if (contactsVisible) {
                            let defaultColors = { ...$3Dmol.elementColors.defaultColors };
                            defaultColors.C = pointColor;
                            viewer.setStyle(
                                {model: activeModel, or: AssemblyPDBResNumSel, not: {atom: bboneAtoms}},
                                {
                                    cartoon:{style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                    stick:{colorscheme: defaultColors},
                                }
                            );
                        }
                        else {
                            viewer.setStyle(
                                {model: activeModel, or: AssemblyPDBResNumSel, not: {atom: bboneAtoms}},
                                {
                                    cartoon:{style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                    stick:{color: pointColor},
                                }
                            );
                        }
                    }
                }

                if (labelsVisible) {
                    for (label of labelsHash[activeModel]["hoveredRes"]) {
                        viewer.removeLabel(label);
                    }
                    labelsHash[activeModel]["hoveredRes"] = [];

                    if (activeModel == "superposition") {
                        if (SuppPDBResNum != undefined) { // this is now an array of (chain, resi) anticipating for multimeric structures
                            let SuppPDBResNumSel = SuppPDBResNum.map(tuple => {
                                return { chain: tuple[0], resi: tuple[1] };
                            });
                            SuppPDBResNumSel.forEach((residue) => {
                                let resChain = residue['chain'];
                                let resNum = residue['resi'];
                                let resSel = {model: protAtomsModel, resi: resNum, chain: resChain};
                                let resName = viewer.selectedAtoms(resSel)[0].resn
                                let label = viewer.addLabel(
                                    resName + String(Pdb2UpDict[resChain][resNum]),
                                    {
                                        alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                        borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                        font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                        inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                    },
                                    {model: protAtomsModel, resi: resNum, chain: resChain, atom: 'CA'},
                                    true,
                                );
                                labelsHash[activeModel]["hoveredRes"].push(label);
                                });
                        }
                        else {
                            console.log(`Residue ${newPointLabel} not found in the structure!`);
                        }
                    }
                    else{ // NOT ADDING LABELS HERE????
                        // AssemblyPDBResNums.forEach((residue) => {
                        //     let resChain = residue['chain'];
                        //     let resNum = residue['resi'];
                        //     let resSel = {model: activeModel, resi: resNum, chain: resChain}
                        //     let resName = viewer.selectedAtoms(resSel)[0].resn
                        //     let label = viewer.addLabel(
                        //         resName + String(Pdb2UpMapAssembly[resChain][resNum]),
                        //         {
                        //             alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                        //             borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                        //             font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                        //             inFront: true, screenOffset: [0, 0, 0], showBackground: true
                        //         },
                        //         {model: activeModel, resi: resNum, chain: resChain, atom: 'CA'},
                        //         true,
                        //     );
                        //     labelsHash[activeModel]["hoveredRes"].push(label);
                        // });
                    }
                }
                if (surfaceVisible) {
                    if (activeModel == "superposition") {
                        for (const [key, value] of Object.entries(surfsDict["superposition"]["single_residues"][CurrentDisplayedSite])) {
                            var numericKey = Number(key.split("_").pop());
                            if (clickedBindingRess.includes(numericKey)) { // if the residue is clicked, do not hide the surfaceAdd commentMore actions
                                // pass
                            }
                            else { // hide the surface for the previously hovered residue (might happen when data points are very close to each other)
                                viewer.setSurfaceMaterialStyle(value.surfid, {color: pointColor, opacity: surfHiddenOpacity});
                            }
                        }
                        // show the surface for the hovered residue
                        let SuppPDBResNum = Up2PdbDict[newPointLabel]; // this is now an array (anticipating multimeric structures)
                        if (SuppPDBResNum != undefined) {
                            for (const [chain, resi] of SuppPDBResNum) {
                                let ResKey = chain + "_" + resi;
                                if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                    let surfid = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey].surfid;
                                    viewer.setSurfaceMaterialStyle(surfid, {color: pointColor, opacity: surfHighOpacity});
                                }
                                else { // create a new surface for the hovered residue
                                    let surfSel = {model: protAtomsModel, resi: resi, chain: chain};
                                    let sitePDBResNums = seg_ress_dict[CurrentDisplayedSite]
                                        .filter(el => Up2PdbDict.hasOwnProperty(el))
                                        .flatMap(el => {
                                            let dataArray = Up2PdbDict[el]; // Get the array of tuples
                                            return dataArray.map(data => {
                                                return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                                            });
                                        });
                                    let SiteSel = {model: protAtomsModel, or: sitePDBResNums};
                                    surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey] = viewer.addSurface(
                                        $3Dmol.SurfaceType.ISO,
                                        {
                                            color: pointColor,
                                            opacity: surfHighOpacity,
                                        },
                                        surfSel,
                                        SiteSel,
                                    );
                                }
                            }
                        }
                        else {
                            // there is no PDB ResNum for this UniProt ResNum
                        }
                    }
                    else {
                        //
                    }
                }
                viewer.render();
            }
        }
    } else if (newLastHoveredPoint !== null) { // when no data point is being hovered on, but the last hovered point is not null (recently hovered on a point)
        let newPointLabel = newChartData[newChartLab][newLastHoveredPoint];
        // if (clickedBindingRess.includes(newPointLabel)) { // if the last hovered point is a binding site residue
        //     resetChartStyles(newChart, newLastHoveredPoint, "#bfd4cb", 10, 16); // changes chart styles to highlight the newly clicked site
        // }
        if (surfaceVisible) {
            if (clickedBindingRess.includes(newPointLabel)) {
                //
            }
            else {
                if (activeModel == "superposition") {
                    if (clickedElements.length == 0) { // no binding site rows are clicked
                        let SuppPDBResNum = Up2PdbDict[newPointLabel]; // this is now an array (anticipating multimeric structures)
                        if (SuppPDBResNum != undefined) {
                            for (const [chain, resi] of SuppPDBResNum) {
                                let ResKey = chain + "_" + resi;
                                if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                    let surfid = surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey].surfid;
                                    viewer.setSurfaceMaterialStyle(surfid, {opacity: surfHiddenOpacity});
                                }
                            }
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
                        // a binding site row is clickedAdd commentMore actions
                    }
                }
                // else {
                //     for (const [key, value] of Object.entries(surfsDict[activeModel])) {
                //         for (const [key2, value2] of Object.entries(value)) {
                //             if (key == newPointLabel) {
                //                 viewer.setSurfaceMaterialStyle(value2.surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                //             }
                //         }
                //     }
                // }
            }
        }
        newLastHoveredPoint = null;

        clearHighlightedRow();

        if (clickedElements.length == 0) {

            if (activeModel == "superposition") {
                if (clickedBindingRess.length == 0) { // no binding site residues are clicked
                    viewer.setStyle(
                        {...protAtoms, model: protAtomsModel},
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );
                }
                else { // some binding site residues are clicked
                    let clickedBindingRessSel = []
                    for (const clickedBindingRes of clickedBindingRess) {
                        let dataArray = Up2PdbDict[clickedBindingRes]; // Get the array of tuples
                        clickedBindingRessSel.push(...dataArray.map(data => {
                            return { chain: data[0], resi: data[1] }; // Extract chain and resi for each element
                        }));
                    }
                    viewer.setStyle(
                        {...protAtoms, model: protAtomsModel, not: {or: clickedBindingRessSel}},
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );
                }
            }
            else {
                if (contactsVisible) {
                    viewer.setStyle(
                        {...protAtoms, model: activeModel, not: {or: allBindingRess}},
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );

                    for (const [key, value] of Object.entries(ligandSitesHash[activeModel])) {
                        let defaultColors = { ...$3Dmol.elementColors.defaultColors };
                        defaultColors.C = value[2];
                        viewer.setStyle( // displaying and colouring again the ligand-interacting residues
                            {model: activeModel, or: value[0]}, // value[0] are the ligand-binding residues selection
                            {
                                cartoon:{style: cartoonStyle, color: value[2], arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                stick:{hidden: false, colorscheme: defaultColors,} // value[2] is colour of the binding site
                            }
                        );
                    }
                }
                else {
                    viewer.setStyle(
                        {...protAtoms, model: activeModel},
                        {cartoon: {style: cartoonStyle, color: defaultColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,}}
                    );
                }
            }

            if (labelsVisible) {
                for (label of labelsHash[activeModel]["hoveredRes"]) {
                    viewer.removeLabel(label);
                }
                labelsHash[activeModel]["hoveredRes"] = [];
            }

            viewer.render();
        }
    }
});

document.getElementById('newChartCanvas').addEventListener('click', function(e) { // when the cursor clicks over the binding residues chart canvas
    let newChartElement = newChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true); // gets the chart element that is closest to the cursorAdd commentMore actions

    let clickedElements = document.getElementsByClassName("clicked-row");

    if (newChartElement.length > 0) { // cursor is hovering over a data point
        let newFirstPoint = newChartElement[0];
        let pointColor = newChart.data.datasets[0].backgroundColor;
        let pointIndex = newFirstPoint.index; // index of the clicked data point
        let pointLabel = newChartData[newChartLab][pointIndex];
        //console.log(`Clicked on Residue ${pointLabel} of Binding Site ${CurrentDisplayedSite}`);

        if (clickedBindingRess.includes(pointLabel)) {
            clickedBindingRess = clickedBindingRess.filter(res => res !== pointLabel); // removes the row id from the clicked binding residues array
            if (pointIndex !== -1) {
                resetChartStyles(newChart, pointIndex, "#ffff99", 10, 16); // changes chart styles to highlight the binding site
                clearClickedResidueRow(ResiduesTable.querySelector(`tr[id="${pointLabel}"]`)); // clears the clicked residue row styles
            }
            if (labelsVisible) {
                let SuppPDBResNum = Up2PdbDict[pointLabel]; // this is now an array (anticipating multimeric structures)
                if (SuppPDBResNum != undefined) {
                    for (const [chain, resi] of SuppPDBResNum) {
                        let ResKey = chain + "_" + resi;
                        if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                            labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].hide(); // hides the label for the clicked residue
                        }
                    }
                }
            }
            if (surfaceVisible) {
                if (activeModel == "superposition") {
                    let SuppPDBResNum = Up2PdbDict[pointLabel]; // this is now an array (anticipating multimeric structures)
                    if (SuppPDBResNum != undefined) {
                        for (const [chain, resi] of SuppPDBResNum) {
                            let ResKey = chain + "_" + resi;
                            if (surfsDict["superposition"]["single_residues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                viewer.setSurfaceMaterialStyle(surfsDict["superposition"]["single_residues"][CurrentDisplayedSite][ResKey].surfid, {opacity: surfHiddenOpacity});
                            }
                        }
                    }
                }
                else {
                    // if (surfsDict[activeModel]["single_residues"].hasOwnProperty(pointLabel)) {
                    //     viewer.setSurfaceMaterialStyle(surfsDict[activeModel]["single_residues"][pointLabel].surfid, {color: defaultColor, opacity: surfHiddenOpacity});
                    // }
                }
            }
        }
        else {
            clickedBindingRess.push(pointLabel); // adds the row id to the clicked binding residues array
            if (pointIndex !== -1) {
                resetChartStyles(newChart, pointIndex, "#bfd4cb", 10, 16); // changes chart styles to highlight the binding site
            }
            clickResiduesTableRow(ResiduesTable.querySelector(`tr[id="${pointLabel}"]`));
            
            if (activeModel == "superposition") {
                if (clickedElements.length == 0){
                    SuppPDBResNum = Up2PdbDict[pointLabel]; // this is now an array (anticipating multimeric structures)
                    if (SuppPDBResNum !== undefined) {
                        for (const [chain, resi] of SuppPDBResNum) {
                            let ResKey = chain + "_" + resi;
                            viewer.setStyle(
                                {model: protAtomsModel, chain: chain, resi: resi, not: {atom: bboneAtoms}},
                                {
                                    cartoon:{style: cartoonStyle, color: pointColor, arrows: cartoonArrows, tubes: cartoonTubes, opacity: cartoonOpacity, thickness: cartoonThickness,},
                                    stick:{color: pointColor},
                                }
                            );
                            if (labelsVisible) {
                                if (labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite].hasOwnProperty(ResKey)) {
                                    console.log(`Residue ${ResKey} already clicked and label exists`);
                                    labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey].show();
                                }
                                else {
                                    //console.log(`Residue ${ResKey} not clicked yet. Creating label...`);
                                    let resSel = {model: protAtomsModel, resi: resi, chain: chain}
                                    let resName = viewer.selectedAtoms(resSel)[0].resn
                                    let label = viewer.addLabel(
                                        resName + String(Pdb2UpDict[chain][resi]),
                                        {
                                            alignment: 'center', backgroundColor: 'white', backgroundOpacity: 1,
                                            borderColor: outlineColor, borderOpacity: 1, borderThickness: 2,
                                            font: 'Arial', fontColor: pointColor, fontOpacity: 1, fontSize: 12,
                                            inFront: true, screenOffset: [0, 0, 0], showBackground: true
                                        },
                                        resSel,
                                        false,
                                    );
                                    labelsHash[activeModel]["clickedResidues"][CurrentDisplayedSite][ResKey] = label; // store the label in the hash
                                }
                            }
                            if (surfaceVisible) {
                                // need to hide other surfaces first
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
                                // I think there is no need to create a new surface here, as the surface for the residue should already exist. It is created when the residue is hovered on.
                            }
                        }
                        viewer.render();
                    }
                    else {
                        console.log("Residue not found in structure!");
                    }
                }
            }
            else {
                //
            }
        }
    }
});