let element = document.querySelector('#container-01');

let config = { backgroundColor: 'white'} 

let viewer = $3Dmol.createViewer( element, config );

$3Dmol.setSyncSurface(true); // all surfaces appear at once

viewer.setViewStyle({'style':'outline','color':'black','width':0.1})

let pdbUri = `/static/data/structures/${segmentReps[segmentId]["rep"]}_trans.pdb`;

jQuery.ajax( pdbUri, { 
    success: function(data) {
    let v = viewer;
    v.addModel( data, "pdb" );                       /* load data */
    v.setStyle({}, {cartoon: {style:'oval', color: 'white', arrows: true}});  /* style all atoms */
    v.zoomTo();                                      /* set camera */
    v.render({});                                    /* render scene */
    v.zoom(1.2, 100);                                /* slight zoom */
    },
    error: function(hdr, status, err) {
    conerrsole.or( "Failed to load PDB " + pdbUri + ": " + err );
    },
});

viewer.resize();