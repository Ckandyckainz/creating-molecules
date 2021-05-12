let addAtomButton = document.getElementById("addatombutton");
let addAtomNumber = document.getElementById("addatomnumber");
let mainCanvas = document.getElementById("maincanvas");
let mainCTX = mainCanvas.getContext("2d");
let addCovalentBondButton = document.getElementById("addcovalentbondbutton");
let removeCovalentBondButton = document.getElementById("removecovalentbondbutton");
let instructionsButton = document.getElementById("instructionsbutton");
let makeStuffMenu = document.getElementById("makestuffmenu");
let instructionsMenu = document.getElementById("instructionsmenu");

class Atom{
    constructor(protons){
        this.protons = protons;
        this.electrons = [];
        this.x = randomBetween(64, 128, 1);
        this.y = randomBetween(64, 128, 1);
        this.firstShellAngle = randomBetween(0, Math.PI*2, 0.01);
        this.secondShellAngle = randomBetween(0, Math.PI*2, 0.01);
        this.covalentBonds = [];
        this.ionicBonds = [];
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
}

class Electron{
    constructor(atom, id){
        this.atom = atom;
        this.id = id;
        this.x;
        this.y;
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
}

class CovalentBond{
    constructor(atom1, atom2){
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

class IonicBond{
    constructor(positiveAtom, negativeAtom){
        this.positiveAtom = positiveAtom;
        this.negativeAtom = negativeAtom;
    }
    drawSelf(ctx){
        ctx.strokeStyle = "#888888FF";
        ctx.lineWidth = 17;
        ctx.beginPath();
        ctx.moveTo(this.positiveAtom.x, this.positiveAtom.y);
        ctx.lineTo(this.negativeAtom.x, this.negativeAtom.y);
        ctx.stroke();
    }
}

mainCTX.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
makeStuffMenu.style.display = "block";
instructionsMenu.style.display = "none";
let atoms = [];
let covalentBonds = [];
let ionicBonds = [];
let covalentBondAtom1 = "none";
let covalentBondAtom2 = "none";
let movingElectron = "none";
let pickTwoAtomsType = "none";
let instructionsShown = false;

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

function createNewIonicBond(positiveAtom, negativeAtom){
    let ionicBond = new IonicBond(positiveAtom, negativeAtom);
    positiveAtom.ionicBonds.push(ionicBond);
    negativeAtom.ionicBonds.push(ionicBond);
    ionicBonds.push(ionicBond);
}

function createNewAtom(protons){
    let atom = new Atom(protons);
    for (i = 0; i < protons; i++) {
        atom.createNewElectron();
    }
    atoms.push(atom);
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

function mainCanvasClicked(event){
    let closestAtom = atoms[0];
    let closestElectron = atoms[0].electrons[0];
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
        function mainCanvasUnclicked(){
            mainCanvas.removeEventListener("mouseup", mainCanvasUnclicked);
            mainCanvas.removeEventListener("mousemove", mouseMoved);
        }
        mainCanvas.addEventListener("mouseup", mainCanvasUnclicked);
        function mouseMoved(moveEvent){
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
                }
                if (pickTwoAtomsType == "remove-covalent-bond") {
                    removeCovalentBond(covalentBondAtom1, covalentBondAtom2);
                }
            }
        }
    } else {
        if ((closestElectron.x-event.clientX)**2 + (closestElectron.y-event.clientY)**2 < 169) {
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
                    let ionicBondId = "none";
                    let ionicBond = "none";
                    for (i=0; i<closestElectron.atom.ionicBonds.length; i++) {
                        if (closestElectron.atom.ionicBonds[i].positiveAtom == closestAtom) {
                            ionicBondId = i;
                            ionicBond = closestElectron.atom.ionicBonds[i];
                        }
                    }
                    if (ionicBond == "none") {
                        createNewIonicBond(closestElectron.atom, closestAtom);
                    } else {
                        closestElectron.atom.ionicBonds.splice(ionicBondId, 1);
                        for (i=0; i<closestAtom.ionicBonds.length; i++) {
                            if (closestAtom.ionicBonds[i] == ionicBond) {
                                ionicBondId = i;
                            }
                        }
                        closestAtom.ionicBonds.splice(ionicBondId, 1);
                        for (i=0; i<ionicBonds.length; i++) {
                            if (ionicBonds[i] == ionicBond) {
                                ionicBondId = i;
                            }
                        }
                        ionicBonds.splice(ionicBondId, 1);
                    }
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
mainCanvas.addEventListener("mousedown", mainCanvasClicked);

function addCovalentBondButtonClicked(){
    pickTwoAtomsType = "add-covalent-bond";
    covalentBondAtom1 = "to-be-added";
    covalentBondAtom2 = "to-be-added";
}
addCovalentBondButton.addEventListener("click", addCovalentBondButtonClicked)

function removeCovalentBondButtonClicked(){
    pickTwoAtomsType = "remove-covalent-bond";
    covalentBondAtom1 = "to-be-added";
    covalentBondAtom2 = "to-be-added";
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
        atom1.electrons.push(toBeRemoved.electrons[toBeRemoved.electrons.length-1]);
        toBeRemoved.electrons.splice(toBeRemoved.electrons.length-1, 1);
        toBeRemoved.electrons[toBeRemoved.electrons.length-1].atom = atom2;
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

drawingLoop();

function drawingLoop(){
    if (instructionsShown) {

    } else {
        mainCTX.fillStyle = "#00000022";
        mainCTX.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        ionicBonds.forEach((ionicBond)=>{
            ionicBond.drawSelf(mainCTX);
        });
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
    }
    requestAnimationFrame(drawingLoop);
}