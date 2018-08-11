class AttributeTable {
    
    //https://sampleserver6.arcgisonline.com/arcgis/rest/services/911CallsHotspot/MapServer/1
    constructor (mapserviceLayerUrl, mapview) {
		this.buttonPages =[];
		this.mapview = mapview;
        this.mapserviceLayerUrl = mapserviceLayerUrl + "/";
 
        this.getCount()
        .then (c =>  this.populatePages(c))
        .catch (err => alert("error! " + err))

    }

resetPages()
{
    this.buttonPages.forEach(b => {
        b.style.color = "black";
    })
}


getCount()
{	
	const attributeTableInstance = this;
    return new Promise((resolve, reject) => {

        //mapservice url sample "https://sampleserver6.arcgisonline.com/arcgis/rest/services/" + selectedService + "/MapServer/"
        let queryurl = this.mapserviceLayerUrl + "query";
		let extent = undefined;

		if (mapview.useExtent) extent = JSON.stringify(attributeTableInstance.mapview.extent);
        let queryOptions = {
							responseType: "json",
                            query:  
                            {
                                f: "json",
								where:"1=1",
								geometry: extent,
								inSR: JSON.stringify(attributeTableInstance.mapview.extent.spatialReference),
								geometryType: "esriGeometryEnvelope",
								spatialRel: "esriSpatialRelEnvelopeIntersects",
                                returnCountOnly: true
                            }
                            }

        Request(queryurl,queryOptions)
        .then (response => resolve(response.data.count))
        .catch (err => reject (0));
     }
    );


}


populatePages(featureCount, initPage=1, initSet = 0)
{
	let pagesCount = Math.ceil(featureCount / DEFAULT_PAGE_SIZE);
	let pagesDiv = document.getElementById("pages");
    //pagesDiv.innerHTML = "";
	while (pagesDiv.firstChild) 
		pagesDiv.removeChild(pagesDiv.firstChild);

	let AttributeTableinstance = this;
	let pagesTodraw = DEFAULT_SET_PAGE_SIZE
	if (pagesCount - initSet < DEFAULT_SET_PAGE_SIZE)
		pagesTodraw = pagesCount - initSet;

	for (let i = initSet; i < initSet + pagesTodraw; i++)
	{
		let page = document.createElement("button");
		page.textContent = i+1;
        this.buttonPages.push(page);
        page.attributeTable = this;
		page.pageNumber = i+1;
		//highlight the first page by default
		
		page.featureCount  = featureCount;
		page.addEventListener("click", function (e) {
                            AttributeTableinstance.resetPages();
                            e.target.style.color = "red";
                            AttributeTableinstance.populateAttributesTable(i+1, featureCount);
						}
		
		);
		
		if (i+1 === initPage) {page.style.color = "red"; page.click()}
		 
		
		pagesDiv.appendChild(page);
	}

	let nextSet = document.createElement("button");
		nextSet.textContent = "Next";
		nextSet.disabled = pagesCount - initSet < DEFAULT_SET_PAGE_SIZE
		nextSet.addEventListener("click", function (e) {
			AttributeTableinstance.resetPages();
			AttributeTableinstance.populatePages(featureCount, initSet + DEFAULT_SET_PAGE_SIZE + 1, initSet + DEFAULT_SET_PAGE_SIZE);
		});
	pagesDiv.appendChild(nextSet);


	//alert("Page count : " + pagesCount );

}


Zoom (e) {
	let oid = e.target.oid;
	let url  = e.target.url;
	
    //mapservice url sample "https://sampleserver6.arcgisonline.com/arcgis/rest/services/" + selectedService + "/MapServer/"
    let queryurl = url + "query";

    let queryOptions = {
                            responseType: "json",
                            query:  
                            {
                                f: "json",
                                objectIds: oid,
								returnGeometry: true,
								outSR: 4326
                            }
                            }

        Request(queryurl,queryOptions)
        .then (response => {
			//when we get the geometry back, create graphic and zoom..
		   // alert(JSON.stringify(response.data));
			//mapview.goTo(response.data.features[0].geometry);
			drawGeometry(response.data.features[0].geometry);
		})
        .catch (err => reject (alert ("ERR: " + err)));	

}

//populate the attribute of a given layer
populateAttributesTable(page, featureCount)
{
	//alert (featureCount);
	let queryurl = this.mapserviceLayerUrl + "query";

	let attributetable = document.getElementById("attributetable");
	attributetable.innerHTML ="";

	let extent = undefined;

	if (mapview.useExtent) extent = JSON.stringify(this.mapview.extent);

	let queryOptions = {
     					responseType: "json",
     					query:  
     					{
							f: "json",
							where:"1=1",
							geometry: extent,
							inSR: JSON.stringify(this.mapview.extent.spatialReference),
							geometryType: "esriGeometryEnvelope",
							spatialRel: "esriSpatialRelEnvelopeIntersects",
							returnCountOnly: false,
							outFields: "*",
							resultOffset: (page - 1) * DEFAULT_PAGE_SIZE,
							resultRecordCount: DEFAULT_PAGE_SIZE
     					}
     				   }

	     Request(queryurl,queryOptions).then (response => 
	     {

	     	//alert(response.data.fields.length);
	     	let table = document.createElement("table");
	     	table.border = 2;
	     	let header = document.createElement("tr");
	     	table.appendChild(header);
			 //populate the fields/ columns
			 let zoomHeader = document.createElement("th");
			 zoomHeader.textContent = "Zoom";
			 header.appendChild(zoomHeader);

	     	for (let i = 0; i < response.data.fields.length; i++)
	     	{
				let column = document.createElement("th");
				column.textContent = response.data.fields[i].alias;
				header.appendChild(column);
	     	}

	     	//loop through all features



	     	for (let j = 0; j < response.data.features.length; j++)
	     	{
	     		let feature = response.data.features[j];
				let row = document.createElement("tr");
				let zoomColumn = document.createElement("td"); 
				let img = document.createElement("img");
				img.style.width = "32px";
				img.style.height = "32px";
				img.src = "images/zoom.png";
				img.url = this.mapserviceLayerUrl;
				img.addEventListener("click", this.Zoom);
				zoomColumn.appendChild(img);
				row.appendChild(zoomColumn);

	     		table.appendChild(row);
	     		for (let i = 0; i < response.data.fields.length; i++)
		     	{
		     		let field = response.data.fields[i];

					let column = document.createElement("td");
					if (field.type === "esriFieldTypeOID") {
						img.oid = feature.attributes[field.name];
					}

					if (field.type === "esriFieldTypeDate")
					{
						let d = new Date(feature.attributes[field.name]);
						column.textContent = d;
					}	 
					else
						column.textContent = feature.attributes[field.name];

					row.appendChild(column);
		     	}

	     	}


	     	attributetable.appendChild(table);



	     }, response => el.style.visibility="hidden" );


}
}