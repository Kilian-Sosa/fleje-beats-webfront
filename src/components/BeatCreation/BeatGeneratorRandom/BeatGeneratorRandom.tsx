import { ChangeEvent, useEffect, useRef, useState } from "react";
import Mark from "../../../interfaces/Mark";
import { BeatFormsList } from "../BeatFormsList";
import "./BeatGeneratorRandom.scss";

export const BeatGeneratorRandom = () => {
  const [audioSelected, setAudioSelected] = useState<string | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [levels, setLevels] = useState<{ level1: Mark[], level2: Mark[], level3: Mark[] } | null>(null);
  const arrowIcon = "./assets/images/icons/arrow.svg";
  const noteIcon = "./assets/images/icons/note.svg";

  const [progressWidth, setProgressWidth] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [selectedMark, setSelectedMark] = useState(0);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setAudioSelected(e.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const generateMarks = (count: number): Mark[] => {
    const duration = audioRef.current?.duration || 0;
    const marks: Mark[] = [];
    for (let i = 0; i < count; i++) {
      marks.push({
        id: i,
        time: Math.random() * duration,
        locationX: ["Left", "Right", "Middle"][Math.floor(Math.random() * 3)],
        locationY: ["Top", "Bottom"][Math.floor(Math.random() * 2)],
        hit: ["Top", "Bottom", "Left", "Right"][Math.floor(Math.random() * 4)],
        formVisible: false,
      });
    }
    return marks.sort((a, b) => a.time - b.time);
  };

  const addAdditionalMarks = (existingMarks: Mark[], count: number): Mark[] => {
    const additionalMarks: Mark[] = [];
    for (let i = 0; i < count; i++) {
      const randomMark = existingMarks[Math.floor(Math.random() * existingMarks.length)];
      additionalMarks.push({
        id: existingMarks.length + i,
        time: randomMark.time,
        locationX: ["Left", "Right", "Middle"][Math.floor(Math.random() * 3)],
        locationY: ["Top", "Bottom"][Math.floor(Math.random() * 2)],
        hit: ["Top", "Bottom", "Left", "Right"][Math.floor(Math.random() * 4)],
        formVisible: false,
      });
    }
    return additionalMarks.sort((a, b) => a.time - b.time);
  };

  const generate = () => {
    if (audioRef.current) {
      const level1 = generateMarks(85).concat(addAdditionalMarks(generateMarks(85), 15));
      const level2 = generateMarks(150).concat(addAdditionalMarks(generateMarks(150), 50));
      const level3 = generateMarks(200).concat(addAdditionalMarks(generateMarks(200), 100));

      setLevels({ level1, level2, level3 });
      selectLevel('level1');
      setMarks(level1);
      console.log({ level1, level2, level3 });
    }
  };

  const selectLevel = (level: 'level1' | 'level2' | 'level3') => {
    if (levels) {
      setMarks(levels[level]);
    }
  };

  useEffect(() => {
    const updateProgressWidth = () => {
      if (audioRef.current && audioRef.current.duration) {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setProgressWidth((currentTime / duration) * 100);
      }
    };

    const intervalId = setInterval(updateProgressWidth, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleAudioEnded = () => {
      console.log(marks);
      setIsPlaying(false);
    };

    if (audioRef.current)
      audioRef.current.addEventListener("ended", handleAudioEnded);
    return () => {
      if (audioRef.current)
        audioRef.current.removeEventListener("ended", handleAudioEnded);
    };
  }, [marks]);

  return (
    <div className="beat-generator-cont">
      <div className="beat-generator-content">
        <section className="input-song">
          <label
            className={"music-input-icons " + (isPlaying ? "dancing" : "")}
            htmlFor="music"
          >
            <img className="arrow" src={arrowIcon} alt="" />
            <img className="note" src={noteIcon} alt="" />
          </label>
          <input
            disabled={isPlaying}
            className="music-input"
            type="file"
            id="music"
            onChange={handleFileChange}
          />

          <div className="marks-cont">
            <div
              className="progress"
              style={{
                width: `${progressWidth}%`,
              }}
            ></div>
            {marks.map((mark, index) => (
              <div
                className={selectedMark === index ? "mark selected" : "mark"}
                key={index}
                style={{
                  left: `${
                    (mark.time / (audioRef.current?.duration || 1)) * 100
                  }%`,
                }}
              ></div>
            ))}
          </div>
        </section>

        <section className="buttons-cont">
          <div>
            {audioSelected && (
              <>
                <audio
                  ref={audioRef}
                  src={audioSelected}
                  style={{ display: "none" }}
                />
                <button onClick={handlePlayPause}>
                  {isPlaying ? "Pause" : "Play"}
                </button>
              </>
            )}
          </div>

          <button disabled={!audioSelected} onClick={generate}>
            Generate
          </button>
          <button disabled={!levels} onClick={() => selectLevel('level1')}>
            Show Level 1
          </button>
          <button disabled={!levels} onClick={() => selectLevel('level2')}>
            Show Level 2
          </button>
          <button disabled={!levels} onClick={() => selectLevel('level3')}>
            Show Level 3
          </button>
        </section>

        {marks && (
          <BeatFormsList
            defaultMarks={marks}
            setMarks={setMarks}
            setSelectedMark={setSelectedMark}
          />
        )}
      </div>
    </div>
  );
};
