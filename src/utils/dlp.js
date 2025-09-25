// Data Loss Prevention (DLP) System
class DLPManager {
  constructor() {
    this.violations = [];
  }

  initialize() {
    this.blockScreenshots();
    this.blockClipboard();
    this.blockRightClick();
    this.blockDevTools();
    this.blockDataExport();
  }

  blockScreenshots() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || 
          (e.ctrlKey && e.shiftKey && e.key === 'S') ||
          (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4'))) {
        e.preventDefault();
        this.logViolation('Screenshot blocked');
        this.showWarning('Screenshots not permitted');
        return false;
      }
    });

    const style = document.createElement('style');
    style.textContent = `
      * { -webkit-user-select: none !important; -moz-user-select: none !important; user-select: none !important; }
      @media print { body { display: none !important; } }
    `;
    document.head.appendChild(style);
  }

  blockClipboard() {
    ['copy', 'cut'].forEach(event => {
      document.addEventListener(event, (e) => {
        e.preventDefault();
        this.logViolation(`${event} blocked`);
        this.showWarning('Copying not permitted');
        return false;
      });
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a'].includes(e.key)) {
        e.preventDefault();
        this.logViolation('Keyboard shortcut blocked');
        this.showWarning('Shortcuts restricted');
        return false;
      }
    });
  }

  blockRightClick() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.logViolation('Right-click blocked');
      this.showWarning('Right-click disabled');
      return false;
    });
  }

  blockDevTools() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        this.logViolation('DevTools blocked');
        this.showWarning('Developer tools disabled');
        return false;
      }
    });
  }

  blockDataExport() {
    window.print = () => {
      this.logViolation('Print blocked');
      this.showWarning('Printing not permitted');
      return false;
    };

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        this.logViolation('Print shortcut blocked');
        this.showWarning('Printing not permitted');
        return false;
      }
    });
  }



  logViolation(type) {
    const violation = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.violations.push(violation);
    console.warn('DLP Violation:', violation);
    
    const existing = JSON.parse(localStorage.getItem('dlpViolations') || '[]');
    existing.push(violation);
    localStorage.setItem('dlpViolations', JSON.stringify(existing));
  }

  showWarning(message) {
    const warning = document.createElement('div');
    warning.innerHTML = `
      <div style="position:fixed;top:20px;right:20px;background:#dc2626;color:white;
        padding:12px 20px;border-radius:8px;z-index:10000;font-weight:bold;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        🚫 ${message}
      </div>
    `;
    document.body.appendChild(warning);
    setTimeout(() => warning.remove(), 3000);
  }
}

const dlpManager = new DLPManager();
export default dlpManager;