class Toc {

    constructor (mapServiceLayer, tocElementString, mapview) {
        this.tocElement = document.getElementById(tocElementString);
        this.mapview = mapview;
        let toc = this.tocElement;
        toc.innerHTML = "";
        let layerlist = document.createElement("ul");
        toc.appendChild(layerlist);
        //populate layers in list
        this.populateLayerRecursive(mapServiceLayer, layerlist);
    }


    //Populate layer subitems in the input element
    populateLayerRecursive(thislayer, layerlist)
    {
  
        let chk = document.createElement("input");
        chk.type = "checkbox";
        chk.value = thislayer.id;
        chk.checked = thislayer.visible;
        chk.addEventListener("click", e => thislayer.visible=e.target.checked )
        
        let lbl = document.createElement("label");
        lbl.textContent = thislayer.title + "       "

        let btn = document.createElement("button");
        btn.textContent = "View";
        //getCount(thislayer.id, btn);
        //on click, open the attribute table
        btn.layerid = thislayer.id;
        btn.layerUrl = thislayer.url;
        btn.mapview = this.mapview;
        btn.addEventListener("click", this.openAttributesTable);

        let layeritem = document.createElement("li");
        layeritem.appendChild(chk);
        layeritem.appendChild(lbl);
        layeritem.appendChild(btn);

        layerlist.appendChild(layeritem);

        if (thislayer.sublayers != null && thislayer.sublayers.items.length > 0)
        {
            let newlist = document.createElement("ul");
            layerlist.appendChild(newlist);
            for (let i = 0; i < thislayer.sublayers.length; i++)
            {
                this.populateLayerRecursive(thislayer.sublayers.items[i],newlist);
    
            }

        }
        //let sublayer = thislayer.sublayers.items[i];
        

    }


    openAttributesTable(e)
    {   
         let attributeTable = new AttributeTable(e.target.layerUrl, e.target.mapview );
    }



}