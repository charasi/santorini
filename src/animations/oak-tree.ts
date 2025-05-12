import { Spine } from "@esotericsoftware/spine-pixi-v8";

// Updated function to position the oak tree and return the sprite with the animation
export const oakTreeAnimation = (x: number, y: number) => {
  console.log("oakTreeAnimation");

  const oakTree = Spine.from({
    skeleton: "oakTreeSkeleton",
    atlas: "oakTreeAtlas",
  });

  // Now safe to get bounds
  const bounds = oakTree.getBounds();
  const scaleX = 128 / bounds.width;
  const scaleY = 150 / bounds.height;
  oakTree.scale.set(scaleX, scaleY);

  // Set animation
  oakTree.state.setAnimation(0, "waves", true);

  //const entry = oakTree.state.addAnimation(0, "waves", true, 0);

  // Set the animation to reverse
  //entry.reverse = true;

  //oakTree.width / 2, oakTree.height;

  // Adjust pivot if necessary (e.g., center bottom)
  //oakTree.pivot.set(0.5, 1);
  oakTree.position.set(x, y - oakTree.height * 0.5); // Slight upward shift

  //oakTree.pivot.set(oakTree.width / 2, oakTree.height);
  //oakTree.pivot.set(0.5, 0);

  // Position the skeleton
  //oakTree.position.set(x, y);

  return oakTree;
};
