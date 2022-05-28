let addAtomButton = document.getElementById("addatombutton");
let addAtomNumber = document.getElementById("addatomnumber");
let mainCanvas = document.getElementById("maincanvas");
let mainCTX = mainCanvas.getContext("2d");
let addCovalentBondButton = document.getElementById("addcovalentbondbutton");
let removeCovalentBondButton = document.getElementById("removecovalentbondbutton");
let instructionsButton = document.getElementById("instructionsbutton");
let makeStuffMenu = document.getElementById("makestuffmenu");
let instructionsMenu = document.getElementById("instructionsmenu");
let atomModeButton = document.getElementById("atommodebutton");
let moleculeModeButton = document.getElementById("moleculemodebutton");
let removeAtomButton = document.getElementById("removeatombutton");
let showMetalicBondsButton = document.getElementById("showmetalicbondsbutton");
let metalicBondsMenu = document.getElementById("metalicbondsmenu");
let addMetalicBondButton = document.getElementById("addmetalicbondbutton");
let addMetalicBondName = document.getElementById("addmetalicbondname");

class Atom{
    constructor(protons){
        this.allId = allIdCounter;
        allIdCounter++;
        this.protons = protons;
        this.electrons = [];
        this.x = randomBetween(64, 128, 1);
        this.y = randomBetween(64, 128, 1);
        this.firstShellAngle = randomBetween(0, Math.PI*2, 0.01);
        this.secondShellAngle = randomBetween(0, Math.PI*2, 0.01);
        this.covalentBonds = [];
        this.metalicBonds = [];
        this.connections = [];
        this.molecule = [];
    }
    drawSelf(ctx){
        if (this.electrons.length+(this.covalentBonds.length*2) > 2) {
            ctx.fillStyle = "#666666FF";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 45, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = colorString(0.194+(this.electrons.length+this.covalentBonds.length-this.protons)/20, 0, 0.258+(this.protons-this.electrons.length-this.covalentBonds.length)/20, 1);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 43, 0, Math.PI*2);
        ctx.fill();
        }
        ctx.fillStyle = "#666666FF";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 31, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = colorString(0.194+(this.electrons.length+this.covalentBonds.length-this.protons)/20, 0, 0.258+(this.protons-this.electrons.length-this.covalentBonds.length)/20, 1);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 29, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFFFF";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 23, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#0000FFFF";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 19, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFFFF";
        ctx.font = "21px Arial";
        ctx.textAlign = "center";
        ctx.fillText(elementSymbols[this.protons-1], this.x, this.y+7);
    }
    createNewElectron(){
        let electron = new Electron(this, this.electrons.length);
        this.electrons.push(electron);
        return electron;
    }
    resetElectronIds(){
        for (i=0; i<this.electrons.length; i++) {
            this.electrons[i].id = i;
        }
    }
    resetConnections(){
        this.connections = [];
        this.covalentBonds.forEach((covalentBond)=>{
            if (covalentBond.atom1.allId != this.allId) {
                if (!arrayHas(this.connections, covalentBond.atom1).hasItem) {
                    this.connections.push(covalentBond.atom1);
                }
            } else {
                if (covalentBond.atom2.allId != this.allId) {
                    if (!arrayHas(this.connections, covalentBond.atom2).hasItem) {
                        this.connections.push(covalentBond.atom2);
                    }
                }
            }
        });
        this.metalicBonds.forEach((metalicBond)=>{
            metalicBond.atoms.forEach((atom)=>{
                if (atom.allId != this.allId) {
                    if (!arrayHas(this.connections, atom).hasItem) {
                        this.connections.push(atom);
                    }
                }
            });
        });
    }
    resetMolecule(){
        this.molecule = [];
        this.resetConnections();
        this.connections.forEach((connection)=>{
            this.addAtomToMolecule(connection);
        });
        return this.molecule;
    }
    addAtomToMolecule(atom){
        if (!arrayHas(this.molecule, atom).hasItem) {
            if (this.allId != atom.allId) {
                this.molecule.push(atom);
                atom.resetConnections();
                atom.connections.forEach((connectedAtom)=>{
                    this.addAtomToMolecule(connectedAtom);
                });
            }
        }
    }
}

class Electron{
    constructor(atom, id){
        this.allId = allIdCounter;
        allIdCounter++;
        this.atom = atom;
        this.id = id;
        this.x;
        this.y;
        this.metalicBond = "none";
        this.metalicBondAtomGoingTo;
        this.metalicBondAngleGoAt;
        this.bondType = "none";
    }
    drawSelf(ctx){
        ctx.fillStyle = "#FFFFFFFF";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#FF0000FF";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI*2);
        ctx.fill();
    }
    goToAtom(){
        if (this.id > 1) {
            this.x = this.atom.x+(Math.cos((Math.PI*2*this.id/(this.atom.electrons.length-2))+this.atom.secondShellAngle))*45;
            this.y = this.atom.y+(Math.sin((Math.PI*2*this.id/(this.atom.electrons.length-2))+this.atom.secondShellAngle))*45;
        } else {
            this.x = this.atom.x+(Math.cos(this.atom.firstShellAngle+(Math.PI*this.id)))*31;
            this.y = this.atom.y+(Math.sin(this.atom.firstShellAngle+(Math.PI*this.id)))*31;
        }
    }
    goToCovalentBond(angle, atom1, atom2, id){
        let aroundX = (atom1.x+atom2.x)/2;
        let aroundY = (atom1.y+atom2.y)/2;
        this.x = aroundX+Math.cos(angle+Math.PI*(id%2))*(Math.floor(id/2)+0.5)*11;
        this.y = aroundY+Math.sin(angle+Math.PI*(id%2))*(Math.floor(id/2)+0.5)*11;
    }
    goToMetalicBond(){
        if ((this.metalicBondAtomGoingTo.x-this.x)**2+(this.metalicBondAtomGoingTo.y-this.y)**2<529) {
            this.resetMetalicBondAtomGoingTo();
        } else {
            this.metalicBondAngleGoAt = Math.atan2(this.metalicBondAtomGoingTo.y-this.y, this.metalicBondAtomGoingTo.x-this.x);
            this.x += Math.cos(this.metalicBondAngleGoAt);
            this.y += Math.sin(this.metalicBondAngleGoAt);
        }
    }
    resetMetalicBondAtomGoingTo(){
        this.metalicBondAtomGoingTo = this.metalicBond.atoms[randomBetween(0, this.metalicBond.atoms.length, 1)];
    }
}

class CovalentBond{
    constructor(atom1, atom2){
        this.allId = allIdCounter;
        allIdCounter++;
        this.atom1 = atom1;
        this.atom2 = atom2;
        this.electrons = [];
    }
    drawSelf(ctx){
        ctx.strokeStyle = "#FFFFFFFF";
        ctx.lineWidth = 4;
        let angle = Math.atan2(-1*(this.atom1.x-this.atom2.x), (this.atom1.y-this.atom2.y));
        for (i=0; i<this.electrons.length/2; i++) {
            ctx.beginPath();
            ctx.moveTo(this.atom1.x+((Math.cos(angle))*(i+0.5-this.electrons.length/4)*11), this.atom1.y+((Math.sin(angle))*(i+0.5-this.electrons.length/4)*11));
            ctx.lineTo(this.atom2.x+((Math.cos(angle))*(i+0.5-this.electrons.length/4)*11), this.atom2.y+((Math.sin(angle))*(i+0.5-this.electrons.length/4)*11));
            ctx.stroke();
        }
        for (i=0; i<this.electrons.length; i++) {
            this.electrons[i].goToCovalentBond(angle, this.atom1, this.atom2, i);
            this.electrons[i].drawSelf(mainCTX);
        }
    }
}

class MetalicBond{
    constructor(){
        this.allId = allIdCounter;
        allIdCounter++;
        this.atoms = [];
        this.electrons = [];
    }
    addAtom(atom){
        this.atoms.push(atom);
        atom.metalicBonds.push(this);
    }
    removeAtom(atom){
        this.atoms.splice(arrayHas(this.atoms, atom).itemPlace, 1);
        atom.metalicBonds.splice(arrayHas(atom.metalicBonds, this).itemPlace, 1);
    }
    addElectron(electron){
        electron.atom.electrons.splice(electron.id, 1);
        electron.atom.resetElectronIds();
        electron.bondType = "metalic";
        if (electron.metalicBond != "none") {
            electron.metalicBond.removeElectron(electron);
        }
        electron.metalicBond = this;
        electron.resetMetalicBondAtomGoingTo();
        this.electrons.push(electron);
    }
    removeElectron(electron){
        electron.atom.electrons.push(electron);
        electron.atom.resetElectronIds();
        electron.bondType = "none";
        electron.metalicBond = "none";
        this.electrons.splice(arrayHas(this.electrons, electron).itemPlace, 1);
    }
    showSelected(ctx, button){
        ctx.strokeStyle = "#FFFF00FF";
        ctx.lineWidth = 4;
        if (button.innerText == "Select Atoms") {
            this.atoms.forEach((atom)=>{
                ctx.beginPath();
                ctx.arc(atom.x, atom.y, 61, 0, Math.PI*2);
                ctx.stroke()
            });
        }
        if (button.innerText == "Select Electrons") {
            this.electrons.forEach((electron)=>{
                ctx.beginPath();
                ctx.arc(electron.x, electron.y, 13, 0, Math.PI*2);
                ctx.stroke()
            });
        }
    }
}

class MetalicBondGUI{
    constructor(metalicBond, parentElement, name){
        this.allId = allIdCounter;
        allIdCounter++;
        this.metalicBond = metalicBond;
        this.parentElement = parentElement;
        this.rootElement = document.createElement("div");
        this.parentElement.appendChild(this.rootElement);
        this.nameInput = document.createElement("input");
        this.nameInput.type = "text";
        this.nameInput.value = name;
        this.rootElement.appendChild(this.nameInput);
        this.selectAtomsButton = document.createElement("button");
        this.selectAtomsButton.innerText = "Select Atoms";
        this.rootElement.appendChild(this.selectAtomsButton);
        this.selectElectronsButton = document.createElement("button");
        this.selectElectronsButton.innerText = "Select Electrons";
        this.rootElement.appendChild(this.selectElectronsButton);
        this.returnElectronsButton = document.createElement("button");
        this.returnElectronsButton.innerText = "Return Electrons";
        this.rootElement.appendChild(this.returnElectronsButton);
        this.deleteSelfButton = document.createElement("button");
        this.deleteSelfButton.innerText = "Delete";
        this.rootElement.appendChild(this.deleteSelfButton);
        this.selectAtomsButton.addEventListener("click", ()=>{
            this.select(this.selectAtomsButton);
        });
        this.selectElectronsButton.addEventListener("click", ()=>{
            this.select(this.selectElectronsButton);
        });
    }
    deselect(button){
        button.style.background = "white";
    }
    select(button){
        if (metalicBondGUISelected != "none") {
            metalicBondGUISelected.deselect(metalicBondButtonSelected);
        }
        if (metalicBondButtonSelected == button) {
            metalicBondGUISelected = "none";
            metalicBondButtonSelected = "none";
        } else {
            button.style.background = "gold";
            metalicBondGUISelected = this;
            metalicBondButtonSelected = button;
        }
    }
}

mainCTX.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
makeStuffMenu.style.display = "block";
instructionsMenu.style.display = "none";
atomModeButton.style.background = "gold";
metalicBondsMenu.style.display = "none";
let atoms = [];
let covalentBonds = [];
let metalicBonds = [];
let closestElectronDefault = "none";
let covalentBondAtom1 = "none";
let covalentBondAtom2 = "none";
let movingElectron = "none";
let pickTwoAtomsType = "none";
let instructionsShown = false;
let allIdCounter = 0;
let mode = "atom";
let metalicBondGUISelected = "none";
let metalicBondButtonSelected = "none";

elementSymbols = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne"];

function randomBetween(min, max, precision){
    return Math.floor((Math.random()*(max-min)+min)/precision)*precision;
}

function colorString(r, g, b, a){
    r = Math.floor(r*255)*256*256*256;
    g = Math.floor(g*255)*256*256;
    b = Math.floor(b*255)*256;
    a = Math.floor(a*255);
    return "#"+(r+g+b+a).toString(16).padStart(8, "0");
}

function arrayHas(array, item){
    let hasItem = false;
    let itemPlace = "none";
    for (i=0; i<array.length; i++) {
        if (array[i].allId == item.allId) {
            hasItem = true;
            itemPlace = i;
        }
    }
    return {hasItem: hasItem, itemPlace: itemPlace};
}

function showMetalicBondsButtonClicked(){
    if (showMetalicBondsButton.style.background == "gold") {
        showMetalicBondsButton.style.background = "white";
        metalicBondsMenu.style.display = "none";
    } else {
        showMetalicBondsButton.style.background = "gold";
        metalicBondsMenu.style.display = "block";
    }
}
showMetalicBondsButton.addEventListener("click", showMetalicBondsButtonClicked);

function addMetalicBondButtonClicked(){
    let metalicBond = new MetalicBond;
    metalicBonds.push(metalicBond);
    let metalicBondGUI = new MetalicBondGUI(metalicBond, metalicBondsMenu, addMetalicBondName.value);
}
addMetalicBondButton.addEventListener("click", addMetalicBondButtonClicked);

function createNewAtom(protons){
    let atom = new Atom(protons);
    for (i = 0; i < protons; i++) {
        atom.createNewElectron();
    }
    atoms.push(atom);
    closestElectronDefault = atom.electrons[atom.electrons.length-1];
    return atom;
}

function addAtomButtonClicked(){
    if (11 > addAtomNumber.value > 0) {
        if (addAtomNumber.value != "") {
            createNewAtom(addAtomNumber.value);
        }
    }
}
addAtomButton.addEventListener("click", addAtomButtonClicked);

function removeAtomButtonClicked(){
    covalentBondAtom2 = "to-be-added";
    pickTwoAtomsType = "remove-atom";
    removeAtomButton.style.background = "gold";
    removeCovalentBondButton.style.background = "white";
    addCovalentBondButton.style.background = "white";
}
removeAtomButton.addEventListener("click", removeAtomButtonClicked);

function mainCanvasClicked(event){
    let closestAtom = atoms[0];
    let closestElectron = closestElectronDefault;
    atoms.forEach((atom)=>{
        if ((closestAtom.x-event.clientX)**2 + (closestAtom.y-event.clientY)**2 > (atom.x-event.clientX)**2 + (atom.y-event.clientY)**2) {
            closestAtom = atom;
        }
        atom.electrons.forEach((electron)=>{
            if ((closestElectron.x-event.clientX)**2 + (closestElectron.y-event.clientY)**2 > (electron.x-event.clientX)**2 + (electron.y-event.clientY)**2) {
                closestElectron = electron;
            }
        });
    });
    if ((closestAtom.x-event.clientX)**2 + (closestAtom.y-event.clientY)**2 < 529) {
        if (metalicBondButtonSelected.innerText == "Select Atoms") {
            if (arrayHas(metalicBondGUISelected.metalicBond.atoms, closestAtom).hasItem) {
                metalicBondGUISelected.metalicBond.removeAtom(closestAtom);
            } else {
                metalicBondGUISelected.metalicBond.addAtom(closestAtom);
            }
        }
        function mainCanvasUnclicked(){
            mainCanvas.removeEventListener("mouseup", mainCanvasUnclicked);
            mainCanvas.removeEventListener("mousemove", mouseMoved);
        }
        mainCanvas.addEventListener("mouseup", mainCanvasUnclicked);
        function mouseMoved(moveEvent){
            if (mode == "molecule") {
                closestAtom.resetMolecule();
                closestAtom.molecule.forEach((atom)=>{
                    atom.x += moveEvent.clientX-closestAtom.x;
                    atom.y += moveEvent.clientY-closestAtom.y;
                });
            }
            closestAtom.x = moveEvent.clientX;
            closestAtom.y = moveEvent.clientY;
        }
        mainCanvas.addEventListener("mousemove", mouseMoved);
        if (covalentBondAtom1 == "to-be-added") {
            covalentBondAtom1 = closestAtom;
        } else {
            if (covalentBondAtom2 == "to-be-added") {
                covalentBondAtom2 = closestAtom;
                if (pickTwoAtomsType == "add-covalent-bond") {
                    addCovalentBond(covalentBondAtom1, covalentBondAtom2);
                    addCovalentBondButton.style.background = "white";
                }
                if (pickTwoAtomsType == "remove-covalent-bond") {
                    removeCovalentBond(covalentBondAtom1, covalentBondAtom2);
                    removeCovalentBondButton.style.background = "white";
                }
                if (pickTwoAtomsType == "remove-atom") {
                    closestAtom.resetConnections();
                    removeAtomButton.style.background = "white";
                    if (closestAtom.connections.length == 0) {
                        atoms.splice(arrayHas(atoms, closestAtom).itemPlace, 1);
                    }
                }
            }
        }
    } else {
        if ((closestElectron.x-event.clientX)**2 + (closestElectron.y-event.clientY)**2 < 169) {
            if (metalicBondButtonSelected.innerText == "Select Electrons") {
                if (arrayHas(metalicBondGUISelected.metalicBond.electrons, closestElectron).hasItem) {
                    metalicBondGUISelected.metalicBond.removeElectron(closestElectron);
                } else {
                    metalicBondGUISelected.metalicBond.addElectron(closestElectron);
                }
            } else {
                movingElectron = closestElectron;
                function mainCanvasUnclicked(){
                    mainCanvas.removeEventListener("mouseup", mainCanvasUnclicked);
                    mainCanvas.removeEventListener("mousemove", mouseMoved);
                    closestAtom = atoms[0];
                    atoms.forEach((atom)=>{
                        if ((closestAtom.x-closestElectron.x)**2 + (closestAtom.y-closestElectron.y)**2 > (atom.x-closestElectron.x)**2 + (atom.y-closestElectron.y)**2) {
                            closestAtom = atom;
                        }
                    });
                    if ((closestAtom.x-closestElectron.x)**2 + (closestAtom.y-closestElectron.y)**2 < 2209) {
                        closestElectron.atom.electrons.splice(closestElectron.id, 1);
                        closestAtom.electrons.push(closestElectron);
                        closestElectron.atom.resetElectronIds();
                        closestElectron.atom = closestAtom;
                        closestAtom.resetElectronIds();
                        movingElectron = "none";
                    }
                }
                mainCanvas.addEventListener("mouseup", mainCanvasUnclicked);
                function mouseMoved(moveEvent){
                    closestElectron.x = moveEvent.clientX;
                    closestElectron.y = moveEvent.clientY;
                }
                mainCanvas.addEventListener("mousemove", mouseMoved);
            }
        }
    }
}
mainCanvas.addEventListener("mousedown", mainCanvasClicked);

function addCovalentBondButtonClicked(){
    pickTwoAtomsType = "add-covalent-bond";
    covalentBondAtom1 = "to-be-added";
    covalentBondAtom2 = "to-be-added";
    addCovalentBondButton.style.background = "gold";
    removeAtomButton.style.background = "white";
    removeCovalentBondButton.style.background = "white";
}
addCovalentBondButton.addEventListener("click", addCovalentBondButtonClicked)

function removeCovalentBondButtonClicked(){
    pickTwoAtomsType = "remove-covalent-bond";
    covalentBondAtom1 = "to-be-added";
    covalentBondAtom2 = "to-be-added";
    removeCovalentBondButton.style.background = "gold";
    removeAtomButton.style.background = "white";
    addCovalentBondButton.style.background = "white";
}
removeCovalentBondButton.addEventListener("click", removeCovalentBondButtonClicked)

function addCovalentBond(atom1, atom2){
    let hasBond = "false";
    let covalentBond = "none";
                covalentBondAtom2.covalentBonds.forEach((covalentBond)=>{
                    if (covalentBond.atom1 == covalentBondAtom1) {
                        hasBond = covalentBond;
                    }
                    if (covalentBond.atom2 == covalentBondAtom1) {
                        hasBond = covalentBond;
                    }
                });
                if (hasBond == "false") {
                    covalentBond = new CovalentBond(atom1, atom2, atom1.electrons[atom1.electrons.length-1], atom2.electrons[atom2.electrons.length-1]);
                    covalentBonds.push(covalentBond);
                } else {
                    covalentBond = hasBond;
                }
    atom1.covalentBonds.push(covalentBond);
    atom2.covalentBonds.push(covalentBond);
    covalentBond.electrons.push(atom1.electrons[atom1.electrons.length-1]);
    covalentBond.electrons.push(atom2.electrons[atom2.electrons.length-1]);
    atom1.electrons[atom1.electrons.length-1].bondType = "covalent";
    atom2.electrons[atom2.electrons.length-1].bondType = "covalent";
    atom1.electrons.splice(atom1.electrons.length-1, 1);
    atom2.electrons.splice(atom2.electrons.length-1, 1);
}

function removeCovalentBond(atom1, atom2){
    let toBeRemoved = "none";
    let toBeRemovedNumber = 0;
    for (i=0; i<atom1.covalentBonds.length; i++) {
        if (atom1.covalentBonds[i].atom1 == atom2) {
            toBeRemoved = atom1.covalentBonds[i];
            toBeRemovedNumber = i;
        } else {
            if (atom1.covalentBonds[i].atom2 == atom2) {
                toBeRemoved = atom1.covalentBonds[i];
                toBeRemovedNumber = i;
            }
        }
    }
    if (toBeRemoved != "none") {
        toBeRemoved.electrons[toBeRemoved.electrons.length-1].atom = atom1;
        toBeRemoved.electrons[toBeRemoved.electrons.length-1].bondType = "none";
        atom1.electrons.push(toBeRemoved.electrons[toBeRemoved.electrons.length-1]);
        toBeRemoved.electrons.splice(toBeRemoved.electrons.length-1, 1);
        toBeRemoved.electrons[toBeRemoved.electrons.length-1].atom = atom2;
        toBeRemoved.electrons[toBeRemoved.electrons.length-1].bondType = "none";
        atom2.electrons.push(toBeRemoved.electrons[toBeRemoved.electrons.length-1]);
        toBeRemoved.electrons.splice(toBeRemoved.electrons.length-1, 1);
        atom1.covalentBonds.splice(toBeRemovedNumber, 1);
        for (i=0; i<atom1.covalentBonds.length; i++) {
            if (atom2.covalentBonds[i].atom1 == atom1) {
                toBeRemovedNumber = i;
            } else {
                if (atom2.covalentBonds[i].atom2 == atom1) {
                    toBeRemovedNumber = i;
                }
            }
        }
        atom2.covalentBonds.splice(toBeRemovedNumber, 1);
    }
}

function instructionsButtonClicked(){
    instructionsShown = !instructionsShown;
    if (instructionsShown) {
        instructionsMenu.style.display = "block";
        makeStuffMenu.style.display = "none";
        instructionsButton.innerText = "<back";
    } else {
        makeStuffMenu.style.display = "block";
        instructionsMenu.style.display = "none";
        instructionsButton.innerText = "instructions";
    }
}
instructionsButton.addEventListener("click", instructionsButtonClicked);

function atomModeButtonClicked(){
    mode = "atom";
    atomModeButton.style.background = "gold";
    moleculeModeButton.style.background = "white";
}
atomModeButton.addEventListener("click", atomModeButtonClicked);

function moleculeModeButtonClicked(){
    mode = "molecule";
    moleculeModeButton.style.background = "gold";
    atomModeButton.style.background = "white";
}
moleculeModeButton.addEventListener("click", moleculeModeButtonClicked);

drawingLoop();

function drawingLoop(){
    if (instructionsShown) {

    } else {
        mainCTX.fillStyle = "#00000022";
        mainCTX.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        covalentBonds.forEach((covalentBond)=>{
            covalentBond.drawSelf(mainCTX);
        });
        atoms.forEach((atom)=>{
            atom.drawSelf(mainCTX);
            atom.electrons.forEach((electron)=>{
                if (electron != movingElectron) {
                    electron.goToAtom();
                }
                electron.drawSelf(mainCTX);
            });
        });
        if (metalicBondGUISelected != "none") {
            metalicBondGUISelected.metalicBond.showSelected(mainCTX, metalicBondButtonSelected);
        }
        metalicBonds.forEach((metalicBond)=>{
            metalicBond.electrons.forEach((electron)=>{
                electron.goToMetalicBond();
                electron.drawSelf(mainCTX);
            });
        });
    }
    requestAnimationFrame(drawingLoop);
}