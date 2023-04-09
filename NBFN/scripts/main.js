function initTable(filterList) {
    document.getElementById("jsonContent").innerHTML = "";
    document.getElementById("loadingMessage").className = "";

    $(document).ready(function () {
        $.getJSON("/NBFN/data/nam_dict.json", 
                function (data) {
            let allNames = [];

            $.each(data, function (key, value) {
                if (checkFilters(key, value.Gender, value.CVBs, value.Rarities))
                {
                    let nameData = document.createElement('tr');
                    nameData.innerHTML += '<td class="name nameColumn">' + 
                        key + '</td>';

                    nameData.innerHTML += '<td class="genderColumn">' + 
                        value.Gender + '</td>';

                    nameData.innerHTML += '<td class="cvbColumn">' + 
                        value.CVBs + '</td>';

                    let allRarities = "";
                    $.each (value.Rarities, function (r1, r2) {
                        allRarities += r1 + ": " + r2 + "<br>";
                    });
                    let rarity = value.Rarities[document.getElementById("countrySelector").value];
                    if (rarity == undefined) {
                        rarity = "?";
                    }
                    nameData.innerHTML += '<td class="rarity rarityColumn">' + 
                        rarity + '<div class=rarityInfoBtn><img src="imgs/info.png"><span>' +
                        allRarities + '</span></td>';
                    allNames.push(nameData);
                }
            });

            allNames = sortEntries(allNames);

            let alternatingColor = "tableRow2";
            const jsonContent = document.getElementById('jsonContent');
            allNames.forEach(name => {
                //assign color
                alternatingColor = alternatingColor == "tableRow2" ? "tableRow1" : "tableRow2";
                name.querySelectorAll('td').forEach(td => {
                    td.classList.add(alternatingColor);
                });

                jsonContent.appendChild(name);
            });
            document.getElementById("loadingMessage").className = "hidden";
        });
    });
}

function loadRarities() {
    const countrySelector = document.getElementById("countrySelector");
    const selectedCountry = countrySelector.value;
    document.getElementById('rarityLoading').classList = "";
    document.getElementById('raritySelection').classList = "hidden";

    const htmlNames = document.querySelectorAll('.name');
    const textNames = [];
    htmlNames.forEach(name => {
        textNames.push(name.innerHTML)
    });

    const rarities = document.querySelectorAll('.rarity');
    let i = 0;
    $(document).ready(function () {
        $.getJSON("/NBFN/data/nam_dict.json", 
                function (data) {
                    rarities.forEach(rarity => {
                        tempRarity = data[textNames[i]].Rarities[selectedCountry];
                        if (tempRarity == undefined) tempRarity = "?";
                        tempRarity += rarity.querySelector(".rarityInfoBtn").outerHTML;
                        rarity.innerHTML = tempRarity;
                        i += 1;
                    });
                    document.getElementById('rarityLoading').classList = "hidden";
                    document.getElementById('raritySelection').classList = "";
                });
    });
}

function addFilter() {
    const addFilter = document.getElementById('addFilter');
    const filtersDiv = document.getElementById('filters');
    const newFilter = document.createElement('div');
    newFilter.classList.add('filter');
    newFilter.id = "filter" + filtersList.length;
    newFilter.innerHTML += `<div class=\"btns\"><img class="delBtn" src="imgs/trashcan.png" onmouseover="this.src='imgs/trashcan_red.png'" onmouseout="this.src='imgs/trashcan.png'" title="Remove Filter" onclick="deleteFilter(this.parentNode.parentNode)">`
    newFilter.innerHTML += `<div class="filterInfoBtn"><img src="imgs/info.png"><span></span></div>`;

    const upArrow = document.createElement('img');
    upArrow.classList.add("arrowBtn");
    if (filtersList.length == 0) {
        upArrow.classList.add("hidden");
    }
    upArrow.src = "imgs/up_arrow.png";
    upArrow.setAttribute('onmouseover', "this.src='imgs/up_arrow_green.png'");
    upArrow.setAttribute('onmouseout', "this.src='imgs/up_arrow.png'");
    upArrow.setAttribute('onclick', "moveFilterUp(this.parentNode.parentNode)")
    upArrow.title = "Move Filter Up";

    const downArrow = document.createElement('img');
    downArrow.classList.add("arrowBtn", "hidden");
    downArrow.src = "imgs/down_arrow.png";
    downArrow.setAttribute('onmouseover', "this.src='imgs/down_arrow_green.png'");
    downArrow.setAttribute('onmouseout', "this.src='imgs/down_arrow.png'");
    downArrow.setAttribute('onclick', "moveFilterDown(this.parentNode.parentNode)")
    downArrow.title = "Move Filter Down";

    const btnsClass = newFilter.querySelector('.btns');
    btnsClass.appendChild(upArrow);
    btnsClass.appendChild(downArrow);

    if (filtersList.length > 0) {
        document.getElementById('filter' + (filtersList.length - 1)).querySelectorAll('.arrowBtn')[1].classList = 'arrowBtn';
    }

    filtersList.push([addFilter.value]);
    switch (addFilter.value) {
        case "revNameSearch":
        case "nameSearch": {
            const input = document.createElement('input');
            input.classList.add('nameFilterInput');
            input.setAttribute('type', 'text');

            newFilter.innerHTML += `<div class="filterInfoBtn"><img src="imgs/info.png"><span>This will only include entries where the name ` + (addFilter.value == "revNameSearch" ? "doesn't match" : "matches") + ` the provided string. The input is case sensitive. You may use the # character to substitute for any character (i.e. "Max" matches "M#x"). You may also use the * character to substitute for any string (i.e. "Maximilian" matches "M*ian"). If you want to ` + (addFilter.value == "revNameSearch" ? "exclude" : "include") + ` names containing a string, you can put a * at the beginning and end of it (i.e. "Maximilian" matches "*axim*").</span></div>`;
            newFilter.innerHTML += `<div class="filterContent"><a>` + (addFilter.value == 'revNameSearch' ? 'Rev ' : '') +`Name Filter: </a></div>`;

            newFilter.querySelector('.filterContent').appendChild(input);
            filtersList[filtersList.length-1].push(input);
            break;
        }

        case "nameLength": {
            const compareSelect = document.createElement('select');
            compareSelect.classList.add('compareSelector');
            compareSelect.innerHTML = `<option value="<">\<</option><option value=">">\></option>`;

            const valueInput = document.createElement('input');
            valueInput.classList.add('nameLengthInput');
            valueInput.setAttribute('type', 'text');

            newFilter.querySelector('span').innerHTML = `This will exclude entries where the length in characters isn't either lesser or greater than the specified one, depending on selection.`;
            newFilter.innerHTML += `<div class="filterContent"><a>Name Length Filter: </a></div>`;

            const filterContentDiv = newFilter.querySelector('.filterContent');
            filterContentDiv.appendChild(compareSelect);
            filterContentDiv.appendChild(valueInput);
            filtersList[filtersList.length-1].push(compareSelect, valueInput);
            break;
        }

        case "revGenderFilter":
        case "genderFilter": {
            const genderSelect = document.createElement('select');
            genderSelect.classList.add('genderFilterSelector');
            genderSelect.innerHTML = `<option value="M">M</option><option value="1M">1M</option><option value="?M">?M</option><option value="F">F</option><option value="1F">1F</option><option value="?F">?F</option><option value="?">?</option>`;

            newFilter.querySelector('span').innerHTML = `This will only include entries where the gender ` + (addFilter.value == "revGenderFilter" ? "doesn't match" : "matches") +` the selected one.`;
            newFilter.innerHTML += `<div class="filterContent"><a>` + (addFilter.value == 'revGenderFilter' ? 'Rev ' : '') + `Gender Filter: </a></div>`;

            newFilter.querySelector('.filterContent').appendChild(genderSelect);
            filtersList[filtersList.length-1].push(genderSelect);
            break;
        }

        case "CVBFilter": {
            const compareSelect = document.createElement('select');
            compareSelect.classList.add('compareSelector');
            compareSelect.innerHTML = `<option value="<">\<</option><option value=">">\></option>`;

            const valueInput = document.createElement('input');
            valueInput.classList.add('cvbFilterInput');
            valueInput.setAttribute('type', 'text');

            newFilter.querySelector('span').innerHTML = `This will exclude entries where the CVB count isn't either lesser or greater than the specified one, depending on selection.`;
            newFilter.innerHTML += `<div class="filterContent"><a>CVB Filter: </a></div>`;

            const filterContentDiv = newFilter.querySelector('.filterContent');
            filterContentDiv.appendChild(compareSelect);
            filterContentDiv.appendChild(valueInput);
            filtersList[filtersList.length-1].push(compareSelect, valueInput);
            break;
        }

        case "rarityFilter": {
            const compareSelect = document.createElement('select');
            compareSelect.classList.add('compareSelector');
            compareSelect.innerHTML = `<option value="<">\<</option><option value=">">\></option>`;

            const valueInput = document.createElement('input');
            valueInput.classList.add('rarityFilterInput');
            valueInput.setAttribute('type', 'text');

            const inText = document.createElement('a');
            inText.innerHTML = "% in ";

            const countrySelect = document.createElement('select');
            countrySelect.classList.add('countrySelect');
            countrySelect.innerHTML = document.getElementById('countrySelector').innerHTML;
            countrySelect.value = document.getElementById('countrySelector').value;

            newFilter.querySelector('span').innerHTML = `This will exclude entries where the rarity for a region isn't either lesser or greater than the specified one, depending on selection. Entries with unknown rarity will also be excluded.`;
            newFilter.innerHTML += `<div class="filterContent"><a>Rarity Filter: </a></div>`;

            const filterContentDiv = newFilter.querySelector('.filterContent');
            filterContentDiv.appendChild(compareSelect);
            filterContentDiv.appendChild(valueInput);
            filterContentDiv.appendChild(inText);
            filterContentDiv.appendChild(countrySelect);
            filtersList[filtersList.length-1].push(compareSelect, valueInput, countrySelect);
            break;
        }

        case "nameSort": {
            const options = document.createElement('select');
            options.classList.add('sortChoice');
            options.innerHTML = `<option value="A-Z">A->Z</option><option value="Z-A">Z->A</option><option value="lenDesc">Length Descending</option><option value="lenAsc">Length Ascending</option>`;

            newFilter.querySelector('.filterInfoBtn').remove();
            newFilter.innerHTML += `<div class="filterContent"><a>Sort by Name: </a></div>`;

            newFilter.querySelector('.filterContent').appendChild(options);
            filtersList[filtersList.length-1].push(options);
            break;
        }

        case "cvbSort": {
            const options = document.createElement('select');
            options.classList.add('sortChoice');
            options.innerHTML = `<option value="cvbAsc">Ascending</option><option value="cvbDesc">Descending</option>`;

            newFilter.querySelector('.filterInfoBtn').remove();
            newFilter.innerHTML += `<div class="filterContent"><a>Sort by CVB Count: </a></div>`;

            newFilter.querySelector('.filterContent').appendChild(options);
            filtersList[filtersList.length-1].push(options);
            break;
        }

        case "raritySort": {
            const countrySelect = document.createElement('select');
            countrySelect.classList.add('countrySelect');
            countrySelect.innerHTML = document.getElementById('countrySelector').innerHTML;
            countrySelect.value = document.getElementById('countrySelector').value;

            const literallyJustAColon = document.createElement('a');
            literallyJustAColon.innerHTML = ": ";

            const options = document.createElement('select');
            options.classList.add('sortChoice');
            options.innerHTML = `<option value="rarityAsc">Ascending</option><option value="rarityDesc">Descending</option>`;

            newFilter.querySelector('span').innerHTML += `Mostly self explanatory. Unknown rarities get sorted to the bottom.`;
            newFilter.innerHTML += `<div class="filterContent"><a>Sort by rarity in </a></div>`;

            const filterContentDiv = newFilter.querySelector('.filterContent');
            filterContentDiv.appendChild(countrySelect);
            filterContentDiv.appendChild(literallyJustAColon);
            filterContentDiv.appendChild(options);
            filtersList[filtersList.length-1].push(options, countrySelect);
        }
    }

    addFilter.value = "std";
    filtersDiv.appendChild(newFilter);
}

function deleteFilter(elem) {
    const index = elem.id[elem.id.length-1];

    filtersList.splice(index, 1);
    elem.remove();
    for (var i = index + 1; i <= filtersList.length; i++) {
        const filter = document.getElementById('filter' + i);
        filter.id = "filter" + (i - 1);
    }

    if (filtersList.length > 0) {
        if (index == 0) {
            document.getElementById('filter' + index).querySelector('.arrowBtn').classList.add('hidden');
        }

        else if (index == filtersList.length) {
            document.getElementById('filter' + (index-1)).querySelectorAll('.arrowBtn')[1].classList.add('hidden');
        }
    }
}

function moveFilterUp(elem) {
    const index = elem.id[elem.id.length-1];

    const elemButtons = elem.querySelectorAll('.arrowBtn');
    const aboveFilter = elem.previousSibling;
    const aboveButtons = aboveFilter.querySelectorAll('.arrowBtn');

    elem.parentNode.insertBefore(elem, aboveFilter);
    elemButtons[0].src = "imgs/up_arrow.png";

    elem.id = 'filter' + (index-1);
    aboveFilter.id = 'filter' + index;

    if (index == 1) {
        elemButtons[0].classList.add('hidden');
        aboveButtons[0].classList = 'arrowBtn';
    }

    if (index == filtersList.length-1) {
        elemButtons[1].classList = 'arrowBtn';
        aboveButtons[1].classList.add('hidden');
    }

    [filtersList[index], filtersList[index-1]] = [filtersList[index-1], filtersList[index]];
}

function moveFilterDown(elem) {
    moveFilterUp(elem.nextSibling);
    elem.querySelectorAll('.arrowBtn')[1].src = "imgs/down_arrow.png";
}

function checkFilters(name, gender, cvbs, rarities) {
    if (filters.length == 0) {
        return true;
    }

    let currentState = true;
    let nameFilters = [];
    let genderFilters = [];

    filtersList.forEach(filter => {
        switch (filter[0]) {
            case 'nameSearch':
                nameFilters.push(filter[1].value);
                break;

            case 'revNameSearch':
                currentState &&= !nameContains(name, filter[1].value);
                break;

            case 'nameLength':
                currentState &&= checkNameLengthFilter(name, filter);
                break;

            case 'genderFilter':
                genderFilters.push(filter[1].value);
                break;

            case 'revGenderFilter':
                currentState &&= gender != filter[1].value;
                break;

            case 'CVBFilter':
                currentState &&= checkCVBFilter(cvbs, filter);
                break;

            case 'rarityFilter':
                currentState &&= checkRarityFilter(rarities, filter);
                break;
        }
    });

    if (nameFilters.length > 0) {
        currentState &&= checkNameFilters(name, nameFilters);
    }

    if (genderFilters.length > 0) {
        currentState &&= checkGenderFilters(gender, genderFilters);
    }

    return currentState;
}

function checkNameFilters(name, filters) {
    let i = 0

    while (i < filters.length) {
        if (nameContains(name, filters[i])) {
            return true;
        }
        i++;
    }

    return false;
}

function nameContains(name, str) {
    let nameIndex = 0;
    let strIndex = 0;
    let afterAny = false;
    while (strIndex < str.length) {
        switch (str[strIndex]) {
            case '#':
                if (nameIndex >= name.length) {
                    return false;
                }
                break;

            case '*':
                nameIndex--;
                afterAny = true;
                break;

            default:
                if (afterAny) {
                    if ((nameIndex = findNext(name, str[strIndex], nameIndex)) == -1) {
                        return false;
                    }

                    afterAny = false;
                }

                else if (name[nameIndex] != str[strIndex]) {
                    return false;
                }
                break;
        }

        nameIndex++;
        strIndex++;
    }

    if (nameIndex < name.length && !afterAny) {
        return false;
    }

    return true;
}

function findNext(str, c, index) {
    let i = index;
    while (i < str.length) {
        if (str[i] == c) {
            return i;
        }
        i++;
    }

    return -1;
}

function checkNameLengthFilter(name, filter) {
    if (filter[1].value == "<") {
        return name.length < parseInt(filter[2].value);
    }

    return name.length > parseInt(filter[2].value);
}

function checkGenderFilters(gender, filters) {
    let i = 0;

    while (i < filters.length) {
        if (gender == filters[i]) {
            return true;
        }

        i++;
    }

    return false;
}

function checkCVBFilter(cvbs, filter) {
    if (filter[1].value == "<") {
        return cvbs < parseInt(filter[2].value);
    }
    return cvbs > parseInt(filter[2].value);
}

function checkRarityFilter(rarities, filter) {
    let toCompare;

    toCompare = rarities[filter[3].value];
    if (toCompare == undefined) {
        return false;
    }
    toCompare = toCompare.substring(1, toCompare.length-1);

    if (filter[1].value == "<") {
        return toCompare < parseFloat(filter[2].value);
    }
    return toCompare > parseFloat(filter[2].value);
}

function sortEntries(entries) {
    if (filtersList.length > 0) {
        const sortedNames = [];

        if (hasAlphabeticSorting) {
            entries.forEach(entry => {
                sortedNames.push(entry.querySelector('.name').innerHTML);
            });
        }

        for (var i = filtersList.length-1; i >= 0; i--) {
            const filter = filtersList[i];

            switch (filter[1].value) {
                case 'A-Z':
                case 'Z-A':
                    //sanitize input
                    entries.forEach(entry => {
                        const name = entry.querySelector('.name');
                        name.innerHTML = sortedNames.indexOf(name.innerHTML);
                    });

                    entries = mergeSort(entries, extractNameNum, filter[1].value == 'Z-A');

                    //unsanitize
                    entries.forEach(entry => {
                        const name = entry.querySelector('.name');
                        name.innerHTML = sortedNames[parseInt(name.innerHTML)];
                    });
                    break;

                case 'lenAsc':
                case 'lenDesc':
                    entries = mergeSort(entries, extractNameLen, filter[1].value == 'lenDesc');
                    break;

                case 'cvbAsc':
                case 'cvbDesc':
                    entries = mergeSort(entries, extractCVBCount, filter[1].value == 'cvbDesc');

                case 'rarityAsc':
                case 'rarityDesc':
                    sortingCountry = filter;
                    entries = mergeSort(entries, extractRarity, filter[1].value == 'rarityDesc');
            }
        }
    }

    return entries;
}

function hasAlphabeticSorting() {
    for (var i = 0; i < filtersList.length; i++) {
        if (filtersList[i][1].value == 'A-Z' || filtersList[i][1].value == 'Z-A') {
            return true;
        }
    }

    return false;
}

function extractNameNum(arg) {
    return parseInt(arg.querySelector('.name').innerHTML);
}

function extractNameLen(arg) {
    return arg.querySelector('.name').innerHTML.length;
}

function extractCVBCount(arg) {
    return parseInt(arg.querySelector('.cvbColumn').innerHTML);
}

function extractRarity(arg, reverse) {
    const rarities = arg.querySelector('span').innerHTML.split("<br>");

    for (var i = 0; i < rarities.length-1; i++) {
        const splitRarity = rarities[i].split(": ");
        splitRarity[1] = splitRarity[1].replace("&lt;", "<").replace("&gt;", ">");

        if (splitRarity[0] == sortingCountry[2].value) {
            return parseFloat(splitRarity[1].substring(1, splitRarity[1].length-1));
        }
    }

    //make question marks appear at the bottom
    if (sortingCountry[1].value == "rarityDesc") {
        return 0;
    }
    return 20;
}

function mergeSort(entries, extractInfo, reverse) {
    if (entries.length < 2) {
        return entries;
    }

    const left = entries.splice(0, entries.length / 2);
    return merge(mergeSort(left, extractInfo, reverse), mergeSort(entries, extractInfo, reverse), extractInfo, reverse);
}

function merge(left, right, extractInfo, reverse) {
    const arr = [];

    while (left.length && right.length) {
        if ((!reverse && extractInfo(left[0]) < extractInfo(right[0])) || (reverse && extractInfo(left[0]) > extractInfo(right[0])) || (extractInfo(left[0]) == extractInfo(right[0]))) {
            arr.push(left.shift());
        } else {
            arr.push(right.shift());
        }
    }

    return [...arr, ...left, ...right];
}

function resizeTable(init=false) {
    if (!init) {
        document.head.removeChild(tableWidths)
    }

    const computedStyles = [window.getComputedStyle(document.getElementById('name')), window.getComputedStyle(document.getElementById('gender')), window.getComputedStyle(document.getElementById('cvbs')), window.getComputedStyle(document.getElementById('raritySelector'))]
    tableWidths = document.createElement('style');
    tableWidths.innerHTML = ".nameColumn {width: " + computedStyles[0].getPropertyValue("width") + ";}" +
    ".genderColumn {width: " + computedStyles[1].getPropertyValue("width") + ";}" +
    ".cvbColumn {width: " + computedStyles[2].getPropertyValue("width") + ";}" +
    ".rarityColumn {width: " + computedStyles[3].getPropertyValue("width") + ";}"
    document.head.appendChild(tableWidths)
}

var tableWidths;
resizeTable(true);
var filtersList = [];
var sortingCountry;
initTable();