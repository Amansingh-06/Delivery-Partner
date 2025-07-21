import { useState, useEffect } from 'react';
// import { useToast } from './customtoast/CustomToast';
import toast from 'react-hot-toast'
import icons from '../../public/icon.png'

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
//   const { showToast } = useToast();
useEffect(() => {
  // Check if the app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    return;
  }

  // Check if prompt already shown in this session
  if (sessionStorage.getItem("installPromptShown")) {
    return;
  }

  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowPrompt(true);
    // Mark prompt as shown in this session
    sessionStorage.setItem("installPromptShown", "true");
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  const handleAppInstalled = () => {
    //   showToast('Application was successfully installed!', "success", "medium");
      toast.success('Application was successfully installed!')
    setShowPrompt(false);
  };

  window.addEventListener('appinstalled', handleAppInstalled);

  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
  };
}, []);

  const handleInstall = () => {
    if (!deferredPrompt) {
      console.log('Installation prompt not available');
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // We no longer need the prompt. Clear it and hide our UI
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  const handleCancel = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-2xl bg-opacity-50">
      <div className={`rounded-lg p-6 shadow-xl max-w-md w-full mx-4 bg-white text-gray-800`}>
        <div className="flex items-center mb-4">
          <div className="mr-3 text-orange w-9  overflow-hidden rounded-full">
            {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg> */}
            <img src={icons} alt="Logo" className='w-full h-9 object-fill'/>
          </div>
          <h2 className="text-xl font-semibold">Install XMeals</h2>
        </div>
        
        <p className="mb-6">Install XMeals App on your device to get a better experience.</p>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={handleCancel}
            className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 hover:scale-102 active:scale-98 cursor-pointer transition duration-300`}
          >
            Not Now
          </button>
          <button 
            onClick={handleInstall}
            className="px-4 py-2 bg-orange text-white rounded hover:bg-orange hover:scale-102 active:scale-98 cursor-pointer transition duration-300"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;