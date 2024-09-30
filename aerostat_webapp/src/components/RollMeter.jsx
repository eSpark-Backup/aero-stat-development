import lines from "../assets/radar.png";
import meter from "../assets/meter.svg";
import { calculateSkyLandPercentage } from "../utils";

const RollMeter = ({ roll, pitch }) => {
  const { sky, land } = calculateSkyLandPercentage(pitch);

  return (
    <div className="radar-container">
      <div style={{ transform: `rotate(${roll}deg)` }} className="radar">
        <div style={{ height: `${sky}%` }} className="sky"></div>
        <div
          style={{
            top: `${sky}%`,
            transform: `translateY(calc(-${sky}% - 2px)) translateX(-50%)`,
          }}
          className="sun"
        ></div>
        <div style={{ height: `${land}%` }} className="land"></div>
        <div className="red-arrow"></div>
        <div style={{ transform: `rotate(${-roll}deg)` }} className="meter-lines"><img src={meter} /></div>
      </div>
      <div className="magnifier">
        <div className="glass"></div>
      </div>
      <div className="lines">
        <img src={lines} />
      </div>
    </div>
  );
};

export default RollMeter;
