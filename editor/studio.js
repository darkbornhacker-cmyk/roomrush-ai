const config = {
    type: Phaser.AUTO,
    parent: 'scene-view',
    width: 1280,
    height: 720,
    backgroundColor: '#10101a',
    scene: { preload: preload, create: create }
};

const game = new Phaser.Game(config);
let scene;
let selectedObject = null;
let sceneObjects = [];
 
const assetList = [
    'logo',
    'player_idle',
    'player_walk',
    'room_background',
    'ui/chat',
    'ui/friends',
    'ui/Hype_boton',
    'ui/hype_button',
    'ui/notifications',
    'ui/reactions',
    'ui/shop',
    'ui/ui_kit'
];

function preload() {
    console.log('Carregando assets:', assetList);
    assetList.forEach(function(key) {
        var path = '../assets/' + key + '.png';
        this.load.image(key.replace(/\//g, '_'), path);
    }, this);
    
    this.load.on('loaderror', function(file) {
        console.error('ERRO: Não achei ' + file.src);
    });
}

function create() {
    scene = this;
    setupUI();
    
    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.add.grid(640, 360, 2048, 2048, 32, 32, 0x000000, 0, 0x00ffff, 0.3).setDepth(-1000);
    
    if (assetList.length === 0) {
        this.add.text(640, 360, 'Configure o assetList no studio.js\npara carregar seus PNGs', {
            fontSize: '24px',
            color: '#ff0055',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    this.input.on('drag', function(pointer, gameObject, dragX, dragY) {
        gameObject.x = Phaser.Math.Snap.To(dragX, 16);
        gameObject.y = Phaser.Math.Snap.To(dragY, 16);
        updateInspector();
    });
    
    this.input.on('gameobjectdown', function(pointer, gameObject) {
        selectObject(gameObject);
    });
}

function setupUI() {
    const browser = document.getElementById('asset-browser');
    
    if (assetList.length === 0) {
        browser.innerHTML = '<p style="color: #ff0055">Edite assetList no studio.js<br>com o nome dos seus PNGs</p>';
        return;
    }
    
    assetList.forEach(function(key) {
        const div = document.createElement('div');
        div.className = 'asset-item';
        div.innerHTML = '<img src="../assets/' + key + '.png" title="' + key + '">';
        div.draggable = true;
        
        div.addEventListener('dragend', function() {
            const pointer = scene.input.activePointer;
            addObjectToScene(key.replace(/\//g, '_'), pointer.worldX, pointer.worldY);
        });
        
        browser.appendChild(div);
    });
    
    document.getElementById('btn-save').onclick = saveScene;
    document.getElementById('btn-load-trigger').onclick = function() {
        document.getElementById('btn-load').click();
    };
    document.getElementById('btn-load').onchange = loadScene;
    document.getElementById('btn-play').onclick = function() {
        window.open('../index.html', '_blank');
    };
    document.getElementById('btn-new').onclick = newScene;
}

function addObjectToScene(key, x, y) {
    const obj = scene.add.image(Phaser.Math.Snap.To(x, 16), Phaser.Math.Snap.To(y, 16), key);
    obj.setInteractive({ draggable: true });
    obj.setData('name', key);
    obj.setData('key', key);
    sceneObjects.push(obj);
    updateHierarchy();
    selectObject(obj);
}

function updateHierarchy() {
    const list = document.getElementById('object-list');
    list.innerHTML = '';
    
    sceneObjects.sort(function(a, b) {
        return a.depth - b.depth;
    }).forEach(function(obj) {
        const li = document.createElement('li');
        li.textContent = obj.getData('name') + ' [' + obj.depth + ']';
        li.onclick = function() { selectObject(obj); };
        if (obj === selectedObject) li.className = 'active';
        list.appendChild(li);
    });
}

function selectObject(obj) {
    selectedObject = obj;
    updateHierarchy();
    updateInspector();
}

function updateInspector() {
    const inspector = document.getElementById('inspector-content');
    
    if (!selectedObject) {
        inspector.innerHTML = '<p>Selecione um objeto</p>';
        return;
    }
    
    inspector.innerHTML = '<label>Name</label><input type="text" value="' + selectedObject.getData('name') + '" id="prop-name"><label>X</label><input type="number" value="' + Math.round(selectedObject.x) + '" id="prop-x"><label>Y</label><input type="number" value="' + Math.round(selectedObject.y) + '" id="prop-y"><label>Depth</label><input type="number" value="' + selectedObject.depth + '" id="prop-depth"><button id="btn-delete">Delete Object</button>';
    
    document.getElementById('prop-name').oninput = function(e) {
        selectedObject.setData('name', e.target.value);
        updateHierarchy();
    };
    document.getElementById('prop-x').oninput = function(e) {
        selectedObject.x = parseFloat(e.target.value);
    };
    document.getElementById('prop-y').oninput = function(e) {
        selectedObject.y = parseFloat(e.target.value);
    };
    document.getElementById('prop-depth').oninput = function(e) {
        selectedObject.setDepth(parseFloat(e.target.value));
        updateHierarchy();
    };
    document.getElementById('btn-delete').onclick = function() {
        selectedObject.destroy();
        sceneObjects = sceneObjects.filter(function(o) {
            return o!== selectedObject;
        });
        selectedObject = null;
        updateHierarchy();
        updateInspector();
    };
}

function newScene() {
    sceneObjects.forEach(function(obj) {
        obj.destroy();
    });
    sceneObjects = [];
    selectedObject = null;
    updateHierarchy();
    updateInspector();
}

function saveScene() {
    const data = {
        objects: sceneObjects.map(function(obj) {
            return {
                name: obj.getData('name'),
                key: obj.getData('key'),
                x: Math.round(obj.x),
                y: Math.round(obj.y),
                depth: obj.depth
            };
        })
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'room.json';
    a.click();
}

function loadScene(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        newScene();
        const data = JSON.parse(event.target.result);
        
        data.objects.forEach(function(objData) {
            const obj = scene.add.image(objData.x, objData.y, objData.key);
            obj.setInteractive({ draggable: true });
            obj.setData('name', objData.name);
            obj.setData('key', objData.key);
            obj.setDepth(objData.depth);
            sceneObjects.push(obj);
        });
        
        updateHierarchy();
    };
    
    reader.readAsText(file);
    e.target.value = '';
}