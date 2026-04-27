class RoomScene extends Phaser.Scene {
    constructor() {
        super('RoomScene');
        this.tileWidth = 64;
        this.tileHeight = 32;
        this.colliders = [];
        this.uiButtons = [];
    }

    preload() {
        const assetList = [
            'logo', 'player_idle', 'player_walk', 'room_background',
            'ui/chat', 'ui/friends', 'ui/Hype_boton', 'ui/hype_button',
            'ui/notifications', 'ui/reactions', 'ui/shop', 'ui/ui_kit'
        ];
        
        assetList.forEach(function(key) {
            this.load.image(key.replace(/\//g, '_'), 'assets/' + key + '.png');
        }, this);
        
        this.load.json('roomData', 'scenes/room.json');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000');
        
        // Carrega objetos do editor
        const roomData = this.cache.json.get('roomData');
        let playerSpawn = { x: 640, y: 360 };
        
        if (roomData && roomData.objects) {
            roomData.objects.forEach(function(obj) {
                const sprite = this.add.image(obj.x, obj.y, obj.key);
                sprite.setDepth(obj.y); // Depth sorting isométrico
                
                // Marca objetos especiais
                if (obj.key === 'player_idle') {
                    playerSpawn = { x: obj.x, y: obj.y };
                    sprite.destroy(); // Player vai ser criado separado
                } else if (obj.key.includes('ui_')) {
                    sprite.setInteractive({ useHandCursor: true });
                    sprite.setScrollFactor(0); // UI fica fixa na tela
                    sprite.setDepth(10000);
                    this.uiButtons.push(sprite);
                    this.setupUIClick(sprite, obj.key);
                } else if (obj.collider) {
                    // Se marcou como collider no editor
                    this.colliders.push(sprite);
                }
            }, this);
        }

        // Cria player
        this.player = this.physics.add.sprite(playerSpawn.x, playerSpawn.y, 'player_idle');
        this.player.setDepth(this.player.y);
        this.player.body.setSize(32, 16).setOffset(16, 48);
        
        // Grid isométrico invisível pra pathfinding
        this.targetPos = new Phaser.Math.Vector2(playerSpawn.x, playerSpawn.y);
        
        // Controles
        this.input.on('pointerdown', function(pointer) {
            if (pointer.y > this.scale.height - 150) return; // Ignora clique na UI
            this.targetPos.x = pointer.worldX;
            this.targetPos.y = pointer.worldY;
        }, this);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        
        // Camera segue player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);
        
        // Depth sorting a cada frame
        this.events.on('update', this.updateDepth, this);
    }
    
    setupUIClick(sprite, key) {
        sprite.on('pointerdown', function() {
            sprite.setTint(0x00ffff);
            this.time.delayedCall(100, function() { sprite.clearTint(); });
            
            if (key === 'ui_shop') {
                console.log('Abrir Shop');
                this.showNotification('Shop em breve!');
            } else if (key === 'ui_friends') {
                console.log('Abrir Friends');
                this.showNotification('Friends em breve!');
            } else if (key === 'ui_chat') {
                console.log('Abrir Chat');
                this.showNotification('Chat em breve!');
            } else if (key.includes('hype')) {
                this.showNotification('HYPE! 🔥');
            }
        }, this);
    }
    
    showNotification(text) {
        const notif = this.add.text(this.scale.width / 2, 100, text, {
            fontSize: '24px',
            color: '#00ffff',
            backgroundColor: '#1a1a2e',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20000);
        
        this.tweens.add({
            targets: notif,
            y: 50,
            alpha: 0,
            duration: 2000,
            onComplete: function() { notif.destroy(); }
        });
    }

    update() {
        const speed = 200;
        let vx = 0;
        let vy = 0;
        
        // WASD
        if (this.wasd.A.isDown || this.cursors.left.isDown) vx = -speed;
        if (this.wasd.D.isDown || this.cursors.right.isDown) vx = speed;
        if (this.wasd.W.isDown || this.cursors.up.isDown) vy = -speed * 0.5; // Isométrico
        if (this.wasd.S.isDown || this.cursors.down.isDown) vy = speed * 0.5;
        
        // Clique pra andar
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.targetPos.x, this.targetPos.y);
        if (dist > 5 && vx === 0 && vy === 0) {
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.targetPos.x, this.targetPos.y);
            vx = Math.cos(angle) * speed;
            vy = Math.sin(angle) * speed * 0.5; // Isométrico
        }
        
        this.player.setVelocity(vx, vy);
        
        // Animação
        if (vx!== 0 || vy!== 0) {
            this.player.setTexture('player_walk');
            this.player.flipX = vx < 0;
        } else {
            this.player.setTexture('player_idle');
        }
    }
    
    updateDepth() {
        // Ordena todos sprites por Y pra depth isométrico correto
        this.children.list.forEach(function(child) {
            if (child.type === 'Image' || child.type === 'Sprite') {
                if (!child.getData('fixedDepth')) {
                    child.setDepth(child.y);
                }
            }
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [RoomScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);