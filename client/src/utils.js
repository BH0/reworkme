const fakeSectionDelta1 = {"ops":[{"insert":"ONE "},{"attributes":{"header":3},"insert":"\n"},{"attributes":{"color":"#666666"},"insert":"Freetime Project - Github Repo: "},{"attributes":{"color":"#1155cc","link":"https://github.com/BH0/Burgent"},"insert":"https://github.com/BH0/Burgent"},{"attributes":{"header":4},"insert":"\n"},{"insert":"Webapp designed to allow quick resume tailoring on the go "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"React frontend with a Rust (Rocket) REST API "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included "},{"attributes":{"color":"#ff0000"},"insert":"optimisations to achieve an X millisecond response time "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included using advance Rust techniques to achieve DRY code that interacts with poorly structured data"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"\n\n"}]}
const fakeSectionDelta2 = {"ops":[{"insert":"TWO "},{"attributes":{"header":3},"insert":"\n"},{"attributes":{"color":"#666666"},"insert":"Freetime Project - Github Repo: "},{"attributes":{"color":"#1155cc","link":"https://github.com/BH0/Burgent"},"insert":"https://github.com/BH0/Burgent"},{"attributes":{"header":4},"insert":"\n"},{"insert":"Webapp designed to allow quick resume tailoring on the go "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Face recognition with PHP backend"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included "},{"attributes":{"color":"#ff0000"},"insert":"optimisations to achieve an X millisecond response time "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included using advance Rust techniques to achieve DRY code that interacts with poorly structured data"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"\n\n"}]}
const fakeSectionDelta3 = {"ops":[{"insert":"THREE "},{"attributes":{"header":3},"insert":"\n"},{"attributes":{"color":"#666666"},"insert":"Freetime Project - Github Repo: "},{"attributes":{"color":"#1155cc","link":"https://github.com/BH0/Burgent"},"insert":"https://github.com/BH0/Burgent"},{"attributes":{"header":4},"insert":"\n"},{"insert":"Webapp designed to allow quick resume tailoring on the go "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"anime recogniser webapp"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included custom ML model which was validated with LIME"},{"attributes":{"color":"#ff0000"},"insert":"optimisations to achieve an X millisecond response time "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included using advance Rust techniques to achieve DRY code that interacts with poorly structured data"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"\n\n"}]}
const fakeSectionDelta4 = {"ops":[{"insert":"FOUR "},{"attributes":{"header":3},"insert":"\n"},{"attributes":{"color":"#666666"},"insert":"Freetime Project - Github Repo: "},{"attributes":{"color":"#1155cc","link":"https://github.com/BH0/Burgent"},"insert":"https://github.com/BH0/Burgent"},{"attributes":{"header":4},"insert":"\n"},{"insert":"Webapp designed to allow quick resume tailoring on the go "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"anime recogniser webapp"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included custom ML model which was validated with LIME"},{"attributes":{"color":"#ff0000"},"insert":"optimisations to achieve an X millisecond response time "},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"Challenges included using advance Rust techniques to achieve DRY code that interacts with poorly structured data"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"\n\n"}]}

const fakeDatabase = {
  resumes: [
    // this resume will display the frontend-projects section at the top & so on 
    {id: 0, title: "Frontend Developer", section_ids:[0, 2, 1]}, 
    // this resume will display the education section at the top & so on 
    {id: 1, title: "Work-in-progress-backend-dev", section_ids:[1, 0]}, // again, title [at least for now] is not coupled with the content 
    {id: 2, title: "UGGGGHHHHHHHHHHH", section_ids:[0, 1]} // again, title [at least for now] is not coupled with the content 
  ], 
  sections: [{
    id: 0, title: "one", delta: fakeSectionDelta1 
  }, {
    id: 1, title: "two", delta: fakeSectionDelta2 
  }, {
    id: 2, title: "three", delta: fakeSectionDelta3, 
    id: 3, title: "four", delta: fakeSectionDelta4 
  }]
}

export const getItemsWithIDsFromDB = (container, desiredAsString, desired_ids) => {
  // obtain IDs of the desired item 
  let desiredPlularized = desiredAsString+"s";
  const source = container // I guess container can be thought of as the starting node 
  let concatenated = desiredAsString.concat("_ids")
  let ids = source[concatenated]
  // determine where items lie within data 
  const desired = fakeDatabase[desiredPlularized]
  // obtain the actual desired items 
  let itemsToReturn = []
  desired.map(desiredItem => {
      if (ids.includes(desiredItem.id)) {
        itemsToReturn.push(desiredItem)
      }
    })
  return itemsToReturn
}

