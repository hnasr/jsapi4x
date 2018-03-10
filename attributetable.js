class AttributeTable {
    
    //https://sampleserver6.arcgisonline.com/arcgis/rest/services/911CallsHotspot/MapServer/1
    constructor (mapserviceLayerUrl) {
        this.buttonPages =[];
        this.mapserviceLayerUrl = mapserviceLayerUrl + "/";
 
        this.getCount()
        .then (c => {  
            this.populatePages(c);
            this.populateAttributesTable(1, c)
        })
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

    return new Promise((resolve, reject) => {

        //mapservice url sample "https://sampleserver6.arcgisonline.com/arcgis/rest/services/" + selectedService + "/MapServer/"
        let queryurl = this.mapserviceLayerUrl + "query";

        let queryOptions = {
                            responseType: "json",
                            query:  
                            {
                                f: "json",
                                where:"1=1",
                                returnCountOnly: true
                            }
                            }

        Request(queryurl,queryOptions)
        .then (response => resolve(response.data.count))
        .catch (err => reject (0));
     }
    );
	

}


populatePages(featureCount)
{
	let pagesCount = Math.ceil(featureCount / DEFAULT_PAGE_SIZE);
	let pagesDiv = document.getElementById("pages");
    pagesDiv.innerHTML = "";
    let AttributeTableinstance = this;
	for (let i = 0; i < pagesCount; i++)
	{
		let page = document.createElement("button");
		page.textContent = i+1;
        this.buttonPages.push(page);
        page.attributeTable = this;
        page.pageNumber = i+1;
        page.featureCount  = featureCount;
		page.addEventListener("click", function (e) {
                            AttributeTableinstance.resetPages();
                            e.target.style.color = "red";
                            AttributeTableinstance.populateAttributesTable(i+1, featureCount);
                        }
        );

		pagesDiv.appendChild(page);
	}
	//alert("Page count : " + pagesCount );

}


//populate the attribute of a given layer
populateAttributesTable(page, featureCount)
{
	//alert (featureCount);
	let queryurl = this.mapserviceLayerUrl + "query";

	let attributetable = document.getElementById("attributetable");
	attributetable.innerHTML ="";

	let queryOptions = {
     					responseType: "json",
     					query:  
     					{
							f: "json",
							where:"1=1",
							returnCountOnly: false,
							outFields: "*",
							resultOffset: (page - 1) * DEFAULT_PAGE_SIZE + 1,
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
	     		table.appendChild(row);
	     		for (let i = 0; i < response.data.fields.length; i++)
		     	{
		     		let field = response.data.fields[i];

					let column = document.createElement("td");
					

					if (field.type == "esriFieldTypeDate")
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