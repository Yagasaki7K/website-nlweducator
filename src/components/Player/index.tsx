import { useRef, useEffect, useState } from 'react';

import Image from 'next/image';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import convertDurationToTimeString from '../../utils/convertDurationToTimeString';

import { usePlayer } from '../../contexts/playerContext';
import styles from './styles.module.scss';

export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    
    const { episodeList, currentEpisodeIndex, isPlaying, togglePlay, setPlayingState,
            playNext, playPrevious, hasNext, hasPrevious, isLooping, toggleLooping,
            isShuffling, toggleShuffle, clearPlayerState } = usePlayer()

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }

        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }

    }, [isPlaying]);

    function setupProgressListener() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', event => {
            setProgress(Math.floor(audioRef.current.currentTime));
        });
    }

    function handleSeek(amount:number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded() {
        if (hasNext) {
            playNext();
        } else {
            clearPlayerState();
        }
    }

    const episode = episodeList[currentEpisodeIndex]

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Playing now"/>
                <strong>Playing Now!</strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <Image width={592} height={592} src={episode.thumbnail} objectFit="cover"/>
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                <strong>Select a podcast to listen</strong>
                </div>
            ) }

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        { episode ? (
                        <Slider 
                        max={episode.duration}
                        value={progress}
                        onChange={handleSeek}
                        trackStyle={{ backgroundColor: '#04D361' }}
                        railStyle={{backgroundColor: '#9F75FF'}}
                        handleStyle={{ borderColor: '#04D361', borderWidth: 4 }}
                        />
                        ) : (
                        <div className={styles.emptySlider}/>)}
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                { episode && (
                    <audio src={episode.url} ref={audioRef} autoPlay loop={isLooping}
                    onPlay={() => setPlayingState(true)}
                    onPause={() => setPlayingState(false)}
                    onEnded={handleEpisodeEnded}
                    onLoadedMetadata={setupProgressListener}/>
                )}

                <div className={styles.buttons}>
                    <button type="button" onClick={toggleShuffle} 
                    className={isShuffling ? styles.isActive : ''} 
                    disabled={!episode || episodeList.length === 1}>
                        <img src="/shuffle.svg" alt="Shuffle"/>
                    </button>
                    <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Previous"/>
                    </button>
                    <button type="button" className={styles.playButton} 
                    disabled={!episode} onClick={togglePlay}>
                        { isPlaying ? <img src="/pause.svg" alt="Play"/> : <img src="/play.svg" alt="Play"/>}
                    </button>
                    <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Next"/>
                    </button>
                    <button type="button" onClick={toggleLooping} className={isLooping ? styles.isActive : ''} disabled={!episode}>
                        <img src="/repeat.svg" alt="Repeat"/>
                    </button>
                </div>
            </footer>
        </div>
    )
}