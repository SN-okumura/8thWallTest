// 8thWall / A-Frame用のカスタムコンポーネント定義
AFRAME.registerComponent('bullet-shooter', {
    schema: {
      speed: {type: 'number', default: 15},     // 弾の飛ぶスピード（m/s）
      maxDistance: {type: 'number', default: 20} // 弾が消滅する最大飛距離（m）
    },
  
    init: function () {
      const el = this.el;
      const data = this.data;
  
      // タップ（またはクリック）イベントのリスナーを追加
      window.addEventListener('click', (event) => {
        this.shootBullet();
      });
    },
  
    shootBullet: function () {
      const sceneEl = this.el.sceneEl;
      const cameraEl = sceneEl.querySelector('a-camera') || document.querySelector('[camera]');
  
      if (!cameraEl) return;
  
      // 1. 弾（エンティティ）の動的生成
      const bullet = document.createElement('a-entity');
      
      // 光弾の見た目（発光する小さな球体）
      bullet.setAttribute('geometry', {
        primitive: 'sphere',
        radius: 0.05
      });
      bullet.setAttribute('material', {
        shader: 'flat',
        color: '#00ffff',     // 仮面ライダーマイスのイメージカラー（シアン等）に調整可能
        emissive: '#00ffff'
      });
  
      // 2. カメラの現在位置と向き（回転）を取得
      const cameraWorldPosition = new THREE.Vector3();
      const cameraWorldDirection = new THREE.Vector3();
      
      cameraEl.object3D.getWorldPosition(cameraWorldPosition);
      cameraEl.object3D.getWorldDirection(cameraWorldDirection);
      // カメラの向きは標準で「後ろ(-Z)」を向いているため反転させる
      cameraWorldDirection.negate();
  
      // 3. 弾の初期位置をカメラの少し前方に設定
      bullet.setAttribute('position', {
        x: cameraWorldPosition.x,
        y: cameraWorldPosition.y,
        z: cameraWorldPosition.z
      });
  
      // シーンに弾を追加
      sceneEl.appendChild(bullet);
  
      // 4. 毎フレームの移動と寿命（消滅）の管理
      let distanceTraveled = 0;
      const speed = this.data.speed;
      const maxDistance = this.data.maxDistance;
  
      const tickHandler = (time, timeDelta) => {
        const deltaSeconds = timeDelta / 1000;
        const moveDistance = speed * deltaSeconds;
  
        // 進行方向に移動
        const currentPos = bullet.object3D.position;
        currentPos.addScaledVector(cameraWorldDirection, moveDistance);
        
        distanceTraveled += moveDistance;
  
        // 一定距離を超えたらメモリリーク防止のために弾を削除
        if (distanceTraveled >= maxDistance) {
          bullet.removeEventListener('loaded', tickHandler);
          bullet.parentNode.removeChild(bullet);
          sceneEl.removeEventListener('animationtick', tickHandler); // 独自のループや組み込みtickを使う場合
        }
      };
  
      // A-Frameのtickシステムを利用して毎フレーム弾を動かす
      bullet.setAttribute('animation-tick', ''); // または組み込みのtickメソッドを活用
      
      // ※簡潔に実装する場合、A-Frameのtick関数を使うアプローチ：
      bullet.tick = function(t, dt) {
        if (!dt) return;
        const deltaSec = dt / 1000;
        const moveDist = speed * deltaSec;
        this.object3D.translateOnAxis(new THREE.Vector3(0, 0, -1), moveDist); // カメラ前方へのシンプルな移動
        
        distanceTraveled += moveDist;
        if (distanceTraveled >= maxDistance) {
          this.parentNode.removeChild(this);
        }
      };
    }
  });