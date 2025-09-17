import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const useQRCodeDownload = () => {
  const { t } = useTranslation();

  const downloadQRCode = useCallback((qrCodeUrl, fileName = 'checkin-qrcode.png') => {
    if (!qrCodeUrl) {
      toast.error(t('checkin_program.qr_code_not_available'));
      return;
    }

    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        toast.error(t('checkin_program.qr_code_canvas_not_found'));
        return;
      }

      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success(t('checkin_program.qr_code_download_success'));
    } catch (error) {
      console.error('Error downloading QR Code:', error);
      toast.error(t('checkin_program.qr_code_download_error'));
    }
  }, [t]);

  return { downloadQRCode };
};

export default useQRCodeDownload;
