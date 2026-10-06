import       { useState, useRef, useEffect } from 'react';
import './Console.css';

const Console = () => {
  const [currentInput, setCurrentInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState([
    { id: 0, name: "Command Prompt", history: [] }
  ]);
  
  const consoleEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize first tab with initial history
    // useEffect(() => {
    //   if (tabs[0].history.length === 0) {
    //     const initialHistory = [
    //       {
    //         command: '',
    //         output: 'Microsoft Windows [Version 10.0.26200.8246]\n(c) Microsoft Corporation. All rights reserved.'
    //       }
    //     ];
    //     setTabs(prev => {
    //       const newTabs = [...prev];
    //       newTabs[0].history = initialHistory;
    //       return newTabs;
    //     });
    //   }
    // }, []);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [tabs, activeTab]);

  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized, isMaximized, activeTab]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.cmd-title-bar') && !e.target.closest('button') && !e.target.closest('.cmd-tab')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isMaximized) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    setTabs([{
      id: 0,
      name: "Command Prompt",
      history: [{
        command: '',
        output: 'Microsoft Windows [Version 10.0.26200.8246]\n(c) Microsoft Corporation. All rights reserved.\n\nC:\\Users\\Lenovo>'
      }]
    }]);
    setActiveTab(0);
  };


  const closeTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // Reset the only tab instead of closing
      setTabs([{
        id: 0,
        name: "Command Prompt",
        history: [{
          command: '',
          output: 'Microsoft Windows [Version 10.0.26200.8246]\n(c) Microsoft Corporation. All rights reserved.\n\nC:\\Users\\Lenovo>'
        }]
      }]);
      setActiveTab(0);
    } else {
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      setTabs(newTabs);
      if (activeTab === tabId) {
        setActiveTab(newTabs[0].id);
      }
    }
  };

  const executeCommand = (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    let output = '';

    if (trimmedCmd === '') {
      output = '';
    } else if (trimmedCmd === 'help') {
      output = `For more information on a specific command, type HELP command-name
ASSOC          Displays or modifies file extension associations.
ATTRIB         Displays or changes file attributes.
BREAK          Sets or clears extended CTRL+C checking.
CD             Displays the name of or changes the current directory.
CHDIR          Displays the name of or changes the current directory.
CLS            Clears the screen.
CMD            Starts a new instance of the Windows command interpreter.
COPY           Copies one or more files to another location.
DATE           Displays or sets the date.
DEL            Deletes one or more files.
DIR            Displays a list of files and subdirectories in a directory.
ECHO           Displays messages, or turns command echoing on or off.
EXIT           Quits the CMD.EXE program (command interpreter).
FIND           Searches for a text string in a file.
HELP           Provides Help information for Windows commands.
MKDIR          Creates a directory.
MOVE           Moves one or more files from one directory to another directory.
REN            Renames a file or files.
RMDIR          Removes a directory.
TIME           Displays or sets the system time.
TYPE           Displays the contents of a text file.
VER            Displays the Windows version.`;
    } else if (trimmedCmd === 'ver') {
      output = 'Microsoft Windows [Version 10.0.26200.8246]';
    } else if (trimmedCmd === 'cls') {
      const newTabs = [...tabs];
      newTabs[activeTab].history = [{
        command: '',
        output: 'Microsoft Windows [Version 10.0.26200.8246]\n(c) Microsoft Corporation. All rights reserved.\n\nC:\\Users\\Lenovo>'
      }];
      setTabs(newTabs);
      return;
    } else if (trimmedCmd === 'dir') {
      output = ` Volume in drive C has no label.
 Volume Serial Number: 1234-5678

 Directory of C:\\Users\\Lenovo

05/12/2026  02:30 PM    <DIR>          .
05/12/2026  02:30 PM    <DIR>          ..
05/12/2026  02:25 PM    <DIR>          Desktop
05/12/2026  02:25 PM    <DIR>          Documents
05/12/2026  02:25 PM    <DIR>          Downloads
05/12/2026  02:25 PM    <DIR>          Music
05/12/2026  02:25 PM    <DIR>          Pictures
05/12/2026  02:25 PM    <DIR>          Videos
               0 File(s)              0 bytes
               8 Dir(s)   500,000,000,000 bytes free`;
    } else if (trimmedCmd === 'cd') {
      output = 'C:\\Users\\Lenovo';
    } else if (trimmedCmd.startsWith('echo ')) {
      output = cmd.substring(5);
    } else if (trimmedCmd === 'time') {
      output = new Date().toLocaleTimeString();
    } else if (trimmedCmd === 'date') {
      output = new Date().toLocaleDateString();
    } else {
      output = `'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`;
    }

    const newTabs = [...tabs];
    const currentHistory = newTabs[activeTab].history;
    newTabs[activeTab].history = [
      ...currentHistory.slice(0, -1),
      { command: cmd, output: output },
      { command: '', output: 'C:\\Users\\Lenovo>' }
    ];
    setTabs(newTabs);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (currentInput.trim() !== '') {
        executeCommand(currentInput);
        setCurrentInput('');
      } else {
        const newTabs = [...tabs];
        const currentHistory = newTabs[activeTab].history;
        newTabs[activeTab].history = [
          ...currentHistory.slice(0, -1),
          { command: '', output: '' },
          { command: '', output: 'C:\\Users\\Lenovo>' }
        ];
        setTabs(newTabs);
        setCurrentInput('');
      }
    }
  };

  if (isMinimized) {
    return (
      <div className="cmd-desktop">
        <div className="cmd-taskbar" onClick={() => setIsMinimized(false)}>
          <span>📟 Command Prompt</span>
        </div>
      </div>
    );
  }

  const currentHistory = tabs[activeTab]?.history || [];

  return (
    <div className="cmd-desktop" onClick={() => inputRef.current?.focus()}>
      <div 
        className={`cmd-window ${isMaximized ? 'cmd-maximized' : ''}`}
        style={{
          left: isMaximized ? 0 : position.x,
          top: isMaximized ? 0 : position.y,
          width: isMaximized ? '100%' : '800px',
          height: isMaximized ? '100%' : '550px'
        }}
      >
        {/* Windows 11 Style Header with Tabs */}
        <div className="cmd-title-bar" onMouseDown={handleMouseDown}>
          <div className="cmd-tabs-container">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`cmd-tab ${activeTab === tab.id ? 'cmd-tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="cmd-tab-icon">📟</span>
                <span className="cmd-tab-title">{tab.name}</span>
                <button 
                  className="cmd-tab-close" 
                  onClick={(e) => closeTab(tab.id, e)}
                >
                  ✕
                </button>
              </div>
            ))}
         
          </div>
          <div className="cmd-buttons">
            <button className="cmd-btn-minimize" onClick={handleMinimize}>─</button>
            <button className="cmd-btn-maximize" onClick={handleMaximize}>□</button>
            <button className="cmd-btn-close" onClick={handleClose}>✕</button>
          </div>
        </div>

        {/* Content */}
        <div className="cmd-content">
          <div className="cmd-output-area">
            {currentHistory.map((item, index) => (
              <div key={index}>
                {item.command !== '' && (
                  <div className="cmd-command-line">
                    <span className="cmd-prompt">C:\Users\Lenovo&gt;</span>
                    <span className="cmd-command">{item.command}</span>
                  </div>
                )}
                {item.output && (
                  <div className="cmd-output-text">{item.output}</div>
                )}
              </div>
            ))}
          </div>
          <div className="cmd-input-line">
            <span className="cmd-prompt">C:\Users\Lenovo&gt;</span>
            <input
              ref={inputRef}
              type="text"
              className="cmd-input"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
              spellCheck={false}
            />
          </div>
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
};

export default Console;