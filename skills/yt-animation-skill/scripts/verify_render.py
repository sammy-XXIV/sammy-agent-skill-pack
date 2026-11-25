"""Verify a movie's technical delivery contract; does not certify visual quality."""
import argparse
from fractions import Fraction
import json
from pathlib import Path
import shutil
import subprocess
import sys


def verify(movie, *, width, height, fps, duration, tolerance=.25,
           allow_no_audio=False, decode=False, ffprobe='ffprobe', ffmpeg='ffmpeg'):
    movie=Path(movie).resolve()
    if not movie.is_file() or movie.stat().st_size==0:
        raise ValueError(f'Movie is missing or empty: {movie}')
    if min(width,height)<=0 or float(Fraction(fps))<=0 or duration<=0 or tolerance<0:
        raise ValueError('Dimensions, fps and duration must be positive; tolerance must be nonnegative')
    probe=shutil.which(str(ffprobe))
    if not probe:
        raise ValueError(f'FFprobe not found: {ffprobe}')
    result=subprocess.run([probe,'-v','error','-show_format','-show_streams','-of','json',str(movie)],
                          capture_output=True,text=True,check=True)
    data=json.loads(result.stdout)
    videos=[s for s in data.get('streams',[]) if s.get('codec_type')=='video' and not s.get('disposition',{}).get('attached_pic')]
    audio=[s for s in data.get('streams',[]) if s.get('codec_type')=='audio']
    if len(videos)!=1:
        raise ValueError(f'Expected one picture stream; found {len(videos)}')
    v=videos[0]
    if (v.get('width'),v.get('height'))!=(width,height):
        raise ValueError(f"Dimensions {v.get('width')}x{v.get('height')} do not match {width}x{height}")
    sar=v.get('sample_aspect_ratio','1:1')
    if sar not in ('N/A','0:1','1:1'):
        raise ValueError(f'Expected square pixels; sample aspect is {sar}')
    dar=v.get('display_aspect_ratio')
    if dar and dar!='N/A' and Fraction(dar.replace(':','/'))!=Fraction(width,height):
        raise ValueError(f'Unexpected display aspect: {dar}')
    rotations=[s.get('rotation',0) for s in v.get('side_data_list',[])]
    rotations.append(v.get('tags',{}).get('rotate',0))
    if any(float(r)%360!=0 for r in rotations):
        raise ValueError('Rotation metadata changes the intended picture orientation')
    actual_fps=Fraction(v.get('avg_frame_rate','0/1'))
    if abs(float(actual_fps-Fraction(fps)))>.001:
        raise ValueError(f'Average fps {actual_fps} does not match {fps}')
    actual_duration=float(data.get('format',{}).get('duration',v.get('duration',0)))
    video_duration=float(v.get('duration',actual_duration))
    if abs(actual_duration-duration)>tolerance or abs(video_duration-duration)>tolerance:
        raise ValueError(f'Duration mismatch: container {actual_duration}, video {video_duration}, expected {duration}')
    if not audio and not allow_no_audio:
        raise ValueError('No audio stream; silence must be intentional and explicitly allowed')
    if decode:
        decoder=shutil.which(str(ffmpeg))
        if not decoder:
            raise ValueError(f'FFmpeg not found: {ffmpeg}')
        subprocess.run([decoder,'-v','error','-xerror','-err_detect','explode','-i',str(movie),
                        '-map','0:v:0','-map','0:a?','-f','null','-'],
                       capture_output=True,text=True,check=True)
    return {
        'movie':str(movie),'technical_checks':'passed',
        'dimensions':[width,height],'display_aspect':f'{Fraction(width,height).numerator}:{Fraction(width,height).denominator}',
        'fps':str(actual_fps),'duration_seconds':actual_duration,'audio_streams':len(audio),
        'full_decode':'passed' if decode else 'not performed',
        'not_certified':['art direction','visual continuity','native render resolution',
                         'distinct animation cadence','narration content','audio mix quality','absence of letterbox bars'],
    }


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('movie',type=Path)
    p.add_argument('--width',type=int,required=True);p.add_argument('--height',type=int,required=True)
    p.add_argument('--fps',required=True,help='For example 24 or 24000/1001')
    p.add_argument('--duration',type=float,required=True)
    p.add_argument('--tolerance',type=float,default=.25)
    p.add_argument('--allow-no-audio',action='store_true');p.add_argument('--decode',action='store_true')
    p.add_argument('--ffprobe',default='ffprobe');p.add_argument('--ffmpeg',default='ffmpeg')
    p.add_argument('--report',type=Path)
    args=p.parse_args()
    options=vars(args).copy();report_path=options.pop('report');movie=options.pop('movie')
    try:
        report=verify(movie,**options)
    except (ValueError,KeyError,ZeroDivisionError,OSError,subprocess.CalledProcessError) as exc:
        detail=getattr(exc,'stderr',None) or str(exc)
        print(f'VERIFICATION FAILED: {detail}',file=sys.stderr)
        return 1
    payload=json.dumps(report,indent=2)
    if report_path:
        report_path.parent.mkdir(parents=True,exist_ok=True)
        report_path.write_text(payload+'\n',encoding='utf-8')
    print(payload)
    return 0


if __name__=='__main__':
    raise SystemExit(main())
