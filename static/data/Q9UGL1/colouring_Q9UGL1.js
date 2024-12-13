<title>3DMol.js experiment</title>
<script src="https://code.jquery.com/jquery-3.6.1.min.js"></script>
<script src="https://3Dmol.org/build/3Dmol-min.js"></script>     
<script src="https://3Dmol.org/build/3Dmol.ui-min.js"></script> 
<div id="container-01" class="mol-container"></div>

<style>
  .mol-container {
    width: 50%;
    height: 75%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: px solid black; /* Adds a black border */
    box-sizing: border-box; /* Ensures that the border is included in the element's total width and height */
  }
</style>

<script>
  // Define a function for applying styles and visualizations
  function applyVisualizationStyles(viewer) {

    
    viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}]}, {stick: {hidden: false, color: "blue", radius: 0.25}}); 
    viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}]}, {sphere: {hidden: false, color: "red", radius: 0.20}});
    viewer.addStyle({resn: "HOH"}, {sphere: {hidden: false, color: "gold", radius: 0.20}});

    viewer.addStyle({and:[{hetflag: true}, {properties:{ bs: -1}}]}, {stick: {hidden: true, color: "grey", radius: 0.25}});
    viewer.addStyle({and:[{hetflag: true}, {properties:{ bs: -1}}]}, {sphere: {hidden: true, color: "grey", radius: 0.20}});


    viewer.addStyle({and:[{hetflag: true}, {not: {properties:{ bs: -1}}}]}, {stick: {hidden: false, colorscheme: myScheme, radius: 0.25}});
    viewer.addStyle({and:[{hetflag: true}, {not: {properties:{ bs: -1}}}]}, {sphere: {hidden: false, colorscheme: myScheme, radius: 0.20}}); 


    viewer.addStyle({resn: "HOH"}, {sphere: {hidden: true, color: "gold", radius: 0.20}});
    viewer.addStyle({resn: "HOH"}, {stick: {hidden: true, color: "gold", radius: 0.25}});
    
    
    viewer.zoomTo(); 
    viewer.render(); 
  }
  
  let element = document.querySelector('#container-01');
  let config = { backgroundColor: 'white', keepH: false };
  let viewer = $3Dmol.createViewer(element, config);
  let pdbUris = [
    '/static/data/Q9UGL1/5fpu_A_trans.cif',
    '/static/data/Q9UGL1/5fz1_A_trans.cif',
    '/static/data/Q9UGL1/5fzi_A_trans.cif',
    '/static/data/Q9UGL1/5fyt_A_trans.cif',
    '/static/data/Q9UGL1/5fyb_A_trans.cif',
    '/static/data/Q9UGL1/5fz8_A_trans.cif',
    '/static/data/Q9UGL1/6ek6_A_trans.cif',
    '/static/data/Q9UGL1/6h52_A_trans.cif',
    '/static/data/Q9UGL1/5fze_A_trans.cif',
    '/static/data/Q9UGL1/5a3p_A_trans.cif',
    '/static/data/Q9UGL1/5fz4_A_trans.cif',
    '/static/data/Q9UGL1/5fzl_A_trans.cif',
    '/static/data/Q9UGL1/5fpl_A_trans.cif',
    '/static/data/Q9UGL1/6eiu_A_trans.cif',
    '/static/data/Q9UGL1/5fy5_A_trans.cif',
    '/static/data/Q9UGL1/6ej0_A_trans.cif',
    '/static/data/Q9UGL1/5fz7_A_trans.cif',
    '/static/data/Q9UGL1/5fzf_A_trans.cif',
    '/static/data/Q9UGL1/6h51_A_trans.cif',
    '/static/data/Q9UGL1/6h4z_A_trans.cif',
    '/static/data/Q9UGL1/5fy9_A_trans.cif',
    '/static/data/Q9UGL1/5fun_A_trans.cif',
    '/static/data/Q9UGL1/5fzc_A_trans.cif',
    '/static/data/Q9UGL1/6eiy_A_trans.cif',
    '/static/data/Q9UGL1/5a3n_A_trans.cif',
    '/static/data/Q9UGL1/5fzm_A_trans.cif',
    '/static/data/Q9UGL1/5fyy_A_trans.cif',
    '/static/data/Q9UGL1/5fv3_A_trans.cif',
    '/static/data/Q9UGL1/5fzd_A_trans.cif',
    '/static/data/Q9UGL1/6rbi_A_trans.cif',
    '/static/data/Q9UGL1/5fza_A_trans.cif',
    '/static/data/Q9UGL1/5fz9_A_trans.cif',
    '/static/data/Q9UGL1/5lw9_A_trans.cif',
    '/static/data/Q9UGL1/5fyu_A_trans.cif',
    '/static/data/Q9UGL1/5fzh_A_trans.cif',
    '/static/data/Q9UGL1/5fz0_A_trans.cif',
    '/static/data/Q9UGL1/5a3t_A_trans.cif',
    '/static/data/Q9UGL1/5a3w_A_trans.cif',
    '/static/data/Q9UGL1/5fz3_A_trans.cif',
    '/static/data/Q9UGL1/6ein_A_trans.cif',
    '/static/data/Q9UGL1/5fyv_A_trans.cif',
    '/static/data/Q9UGL1/5fzk_A_trans.cif',
    '/static/data/Q9UGL1/5a1f_A_trans.cif',
    '/static/data/Q9UGL1/5fup_A_trans.cif',
    '/static/data/Q9UGL1/5fzb_A_trans.cif',
    '/static/data/Q9UGL1/5lwb_A_trans.cif',
    '/static/data/Q9UGL1/5fyz_A_trans.cif',
    '/static/data/Q9UGL1/5fzg_A_trans.cif',
    '/static/data/Q9UGL1/6h50_A_trans.cif',
    '/static/data/Q9UGL1/6ej1_A_trans.cif',
    '/static/data/Q9UGL1/5fz6_A_trans.cif',
    '/static/data/Q9UGL1/5fy4_A_trans.cif',
    '/static/data/Q9UGL1/5fys_A_trans.cif'
  ];
  let loadedCount = 0; // Counter for loaded structures
  let models = [];
  let modelOrder = {}; // creating dictionary to save the order in which files get loaded
  let modelOrderRev = {};
  pdbUris.forEach(pdbUri => {
    jQuery.ajax(pdbUri, {
      success: function(data) {
        let model = viewer.addModel(data, "cif"); // Load data
        let modelID = model.getID();
        let pdbID = pdbUri.split("/").pop().split("_")[0];
        <!-- console.log("Loaded model", pdbUri, modelID, loadedCount); -->
        modelOrder[pdbUri] = modelID;
        modelOrderRev[modelID] = pdbID;
        models.push(model);
        loadedCount++; // Increment counter
        if (loadedCount === pdbUris.length) { // All structures are loaded, apply styles
          console.log("All structures loaded");
          console.log("Model order", modelOrder);
          <!-- applyVisualizationStyles(viewer) -->

          viewer.setViewStyle({style:"outline", width:0.0625, color:"black"});
          viewer.setStyle({hetflag: false}, {cartoon: {hidden: false, style: 'oval', color: 'white', arrows: true,  thickness: 0.25}});
          viewer.setStyle({hetflag: true}, {stick: {hidden: true, radius: 0.25}});
          viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}]}, {stick: {hidden: false, color: "blue", radius: 0.25}}); 
          viewer.addStyle({and:[{hetflag: true}, {not:{resn: "HOH"}}]}, {sphere: {hidden: false, color: "red", radius: 0.20}});
          viewer.addStyle({resn: "HOH"}, {sphere: {hidden: false, color: "gold", radius: 0.20}});

          viewer.setHoverable({}, true, 
            function(atom,viewer,event,container) {
              if(!atom.label) {
                atom.label = viewer.addLabel(
                  reversedModelOrder[atom.model] + " " + atom.chain + " " + atom.resn + " " + atom.resi + " " + atom.atom,
                  {position: atom, backgroundColor: 'mintcream', fontColor:'black', borderColor: 'black', borderThickness: 2}
                );
              }
            },
            function(atom) {
              if(atom.label) {
                viewer.removeLabel(atom.label);
                delete atom.label;
              }
            }
          );

          viewer.zoomTo(); 
          viewer.render(); 
        }
      },
      error: function(hdr, status, err) {
        console.error("Failed to load PDB " + pdbUri + ": " + err);
        // Error handling, potentially increment loadedCount or handle differently
      },
    });
  });
  </script>