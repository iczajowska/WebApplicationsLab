var phonebook = document.getElementById("phoneBook");

var firstname = document.getElementById("fname");
var phone = document.getElementById("tnumber");

var numList = 2;
var lastId = 2;

var errorField = "border: 2px solid red";
var correctField = "border: 1px solid #ccc;";

init();

function init(){

    for(var i=1; i<=lastId; i++){
        var getBin = document.getElementById(`b${i}`);
        getBin.onclick = function(){
            removeFromList(this.id);
        };
        
        var getIcon = document.getElementById(`i${i}`);
        getIcon.onclick = function(){
            removeFromList(this.id);
        };
    }
}

function removeFromList(elementID){
    elementID = elementID.substring(1);

    console.log(elementID);
    getElement = document.getElementById(`f${elementID}`);
    getElement.parentNode.removeChild(getElement);    
    numList -= 1;
}

function checkForm(){


    var fn = firstname.value;
    var ph = phone.value;
    

    if( fn === ''){
        alert("provide name");
        firstname.value = '';
        firstname.style = errorField;
        return;
        
    } else{
        firstname.style = correctField;
    }


    if(!checkPhone(ph)){
        alert("incorect phone number");
        phone.value = '';
        phone.style = errorField;
        return;
    } else {
        phone.style = correctField;
    }

    createElement(fn,ph);

    firstname.value ='';
    phone.value = '';
}

function checkPhone(ph){
    var regPhone = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
    var flag = regPhone.test(ph.trim());
    return flag;
    /*
    (123) 456-7890; +(123) 456-7890; +(123)-456-7890; +(123) - 456-7890; +(123) - 456-78-90; 
    123-456-7890; 123.456.7890; 1234567890; +31636363634; 075-63546725*/
}

function createElement(n, p){
    lastId += 1;
    
    var dane = document.createElement("div");
    dane.innerHTML = 
    `<div>
    <h5 style="color: black;">${n}</h5>
    <p>${p}</p>
    </div>`;

    var trash = document.createElement("div");
    trash.setAttribute("class", "bin");

    var button = document.createElement("button");
    button.setAttribute("id", `b${lastId}`);
    button.onclick = function(){
        removeFromList(this.id);
    };

    var icon = document.createElement("div");
    icon.setAttribute("id", `i${lastId}`);
    icon.setAttribute("class", "fas fa-trash-alt");
    icon.onclick = function(){
        removeFromList(this.id);
    };

    button.appendChild(icon);
    trash.appendChild(button);


    var newElement = document.createElement("div");
    newElement.setAttribute("id", `f${lastId}`);
    newElement.setAttribute("class", "formularz");

    newElement.appendChild(dane);
    newElement.appendChild(trash);

    phonebook.appendChild(newElement);
}


