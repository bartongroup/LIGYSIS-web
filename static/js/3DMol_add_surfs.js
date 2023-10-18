
for (const [key, value] of Object.entries(seg_ress_dict)) {
    if (key == "ALL_BINDING") {
        surfsDict["non_binding"] = viewer.addSurface(
            $3Dmol.SurfaceType.ISO,
            {
                color: 'white',
                opacity: 0.0,
            },
            {resi: seg_ress_dict[key], invert: true},
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
            {resi: seg_ress_dict[key]},
            {resi: seg_ress_dict[key]},
        );
    }
}
viewer.render();