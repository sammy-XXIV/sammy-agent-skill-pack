"""Exercise real FFmpeg fixtures in an automatically cleaned temporary directory."""
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from verify_render import verify


@unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'),'FFmpeg/FFprobe required')
class DeliveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory(prefix='yt-animation-check-')
        cls.movie=Path(cls.temp.name)/'fixture.mp4'
        subprocess.run([shutil.which('ffmpeg'),'-v','error','-y',
                        '-f','lavfi','-i','color=c=gray:s=320x180:r=24',
                        '-f','lavfi','-i','sine=frequency=440:sample_rate=48000',
                        '-t','1','-c:v','libx264','-preset','ultrafast',
                        '-pix_fmt','yuv420p','-c:a','aac',str(cls.movie)],check=True)
        cls.contract={'width':320,'height':180,'fps':'24','duration':1}

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_actual_movie_full_decode(self):
        report=verify(self.movie,decode=True,**self.contract)
        self.assertEqual(report['full_decode'],'passed')
        self.assertEqual(report['display_aspect'],'16:9')
        self.assertIn('art direction',report['not_certified'])

    def test_wrong_dimensions_rejected(self):
        with self.assertRaisesRegex(ValueError,'Dimensions'):
            verify(self.movie,**{**self.contract,'width':640})

    def test_wrong_rate_rejected(self):
        with self.assertRaisesRegex(ValueError,'fps'):
            verify(self.movie,**{**self.contract,'fps':'30'})

    def test_wrong_duration_rejected(self):
        with self.assertRaisesRegex(ValueError,'Duration'):
            verify(self.movie,**{**self.contract,'duration':2})

    def test_missing_movie_rejected(self):
        with self.assertRaisesRegex(ValueError,'missing'):
            verify(self.movie.with_name('missing.mp4'),**self.contract)

    def test_audio_requirement_and_override(self):
        silent=self.movie.with_name('silent.mp4')
        subprocess.run([shutil.which('ffmpeg'),'-v','error','-y','-i',str(self.movie),'-an','-c:v','copy',str(silent)],check=True)
        with self.assertRaisesRegex(ValueError,'No audio'):
            verify(silent,**self.contract)
        self.assertEqual(verify(silent,allow_no_audio=True,**self.contract)['audio_streams'],0)

    def test_cli_report(self):
        import sys
        report=self.movie.with_name('report.json')
        result=subprocess.run([sys.executable,str(Path(__file__).with_name('verify_render.py')),str(self.movie),
                               '--width','320','--height','180','--fps','24','--duration','1','--decode','--report',str(report)],
                              capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual(json.loads(report.read_text())['technical_checks'],'passed')


if __name__=='__main__':
    unittest.main()
