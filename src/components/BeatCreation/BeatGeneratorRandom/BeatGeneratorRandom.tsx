import { ChangeEvent, useEffect, useRef, useState } from "react";
import Mark from "../../../interfaces/Mark";
import { BeatFormsList } from "../BeatFormsList";
import "./BeatGeneratorRandom.scss";

export const BeatGeneratorRandom = () => {
  const [audioSelected, setAudioSelected] = useState<string | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [levels, setLevels] = useState<{ level1: Mark[], level2: Mark[], level3: Mark[] } | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'level1' | 'level2' | 'level3' | null>(null);

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

  const generateMarks = (beatDensity: number): Mark[] => {
    const duration = audioRef.current?.duration || 0;
    const count = Math.ceil(duration * beatDensity * duration);
    const marks: Mark[] = [];
    const timeCounts: { [key: number]: { count: number; positions: string[] } } = {};
  
    for (let i = 0; i < count; i++) {
      let time = Math.random() * duration;
      let tries = 0;
  
      while (timeCounts[time]?.count >= 2 && tries < 10) {
        time = Math.random() * duration;
        tries++;
      }
  
      if (!timeCounts[time]) {
        timeCounts[time] = { count: 0, positions: [] };
      }
      timeCounts[time].count++;
  
      const locationX = ["Left", "Right", "Middle"][Math.floor(Math.random() * 3)];
      const locationY = ["Top", "Bottom"][Math.floor(Math.random() * 2)];
  
      timeCounts[time].positions.push(`${locationX}-${locationY}`);
  
      marks.push({
        id: i,
        time,
        locationX,
        locationY,
        hit: ["Top", "Bottom", "Left", "Right"][Math.floor(Math.random() * 4)],
        formVisible: false,
      });
    }
  
    return marks.sort((a, b) => a.time - b.time);
  };
  
  const addAdditionalMarks = (existingMarks: Mark[], percentage: number): Mark[] => {
    const count = Math.ceil(existingMarks.length * percentage);
    const additionalMarks: Mark[] = [];
    const timeCounts: { [key: number]: { count: number; positions: string[] } } = {};
  
    existingMarks.forEach(mark => {
      if (!timeCounts[mark.time]) {
        timeCounts[mark.time] = { count: 0, positions: [] };
      }
      timeCounts[mark.time].count++;
      timeCounts[mark.time].positions.push(`${mark.locationX}-${mark.locationY}`);
    });
  
    for (let i = 0; i < count; i++) {
      const randomMark = existingMarks[Math.floor(Math.random() * existingMarks.length)];
      let time = randomMark.time;
      let tries = 0;
      let locationX = "";
      let locationY = "";
  
      do {
        locationX = ["Left", "Right", "Middle"][Math.floor(Math.random() * 3)];
        locationY = ["Top", "Bottom"][Math.floor(Math.random() * 2)];
        tries++;
      } while (
        timeCounts[time]?.positions.includes(`${locationX}-${locationY}`) &&
        tries < 10
      );
  
      if (tries < 10) {
        timeCounts[time].count++;
        timeCounts[time].positions.push(`${locationX}-${locationY}`);
  
        additionalMarks.push({
          id: existingMarks.length + i,
          time,
          locationX,
          locationY,
          hit: ["Top", "Bottom", "Left", "Right"][Math.floor(Math.random() * 4)],
          formVisible: false,
        });
      }
    }
  
    return additionalMarks.sort((a, b) => a.time - b.time);
  };
  

  const generate = () => {
    if (audioRef.current) {
      // Generate marks for each level
      const marksLevel1 = generateMarks(0.007);
      const marksLevel2 = generateMarks(0.01);
      const marksLevel3 = generateMarks(0.015);

      // Concatenate additional marks for each level
      const level1 = marksLevel1.concat(addAdditionalMarks(marksLevel1, 0.15));
      const level2 = marksLevel2.concat(addAdditionalMarks(marksLevel2, 0.35));
      const level3 = marksLevel3.concat(addAdditionalMarks(marksLevel3, 0.5));

      setLevels({ level1, level2, level3 });
      selectLevel('level1');
      setMarks(level1);
    }
  };

  const selectLevel = (level: 'level1' | 'level2' | 'level3') => {
    if (levels) {
      setMarks(levels[level]);
      setSelectedLevel(level);
    }
  };

  const handleDownload = (level: 'level1' | 'level2' | 'level3') => {
    if (!levels) return;
  
    const filteredMarks = levels[level].map(({ id, formVisible, ...rest }) => rest);
    const data = { beatData: filteredMarks };
    downloadJSON(data, `${level}.json`);
  };
  
  const downloadJSON = (data: any, filename: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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
  
          {selectedLevel && (
            <button onClick={() => handleDownload(selectedLevel)}>
              Download {selectedLevel.replace('level', 'Level ')}
            </button>
          )}
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
