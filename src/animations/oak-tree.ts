import { Spine } from "@esotericsoftware/spine-pixi-v8";

export const oakTreeAnimation = (x: number, y: number) => {
  console.log("oakTreeAnimation");

  const oakTree = Spine.from({
    skeleton: "oakTreeSkeleton",
    atlas: "oakTreeAtlas",
  });

  // Get bounds to scale
  const bounds = oakTree.getBounds();
  const scaleX = 128 / bounds.width;
  const scaleY = 150 / bounds.height;
  oakTree.scale.set(scaleX, scaleY);

  // Set the animation
  oakTree.state.setAnimation(0, "waves", true);

  // Position tree (shift up to sit on the tile nicely)
  oakTree.position.set(x, y - oakTree.height * 0.5);

  return oakTree;
};
