// Student class
// The Student object will be a node on the tree
class Student
{
    constructor(user_id, color, url)
    {
        this.id = user_id;
        this.color = color;
        this.url = url
        this.left = null;
        this.right = null;
    }
}


class BinarySearchTree
{
    constructor()
    {
        // root of a binary seach tree
        console.log("Setting root to null")
        this.root = null;
    }

  // Insert
  // Creates a new node with a user ID and color.
  // If the tree is empty it add this node to a tree and make it a
  // root, otherwise it calls insert(node, user_id, color).
    insert(user_id, color, url)
  {
      // Creating a node and initailising
      // with id
      var newNode = new Student(user_id, color, url);
      // root is null then node will
      // be added to the tree and made root.
      if(this.root === null) {
        console.log("Root is now "+ newNode.id)
          this.root = newNode;
          }
      else {
        // find the correct position in the
        // tree and add the node
          console.log("Recursing to insert new node")
          this.insertNode(this.root, newNode);
        }
  }

  // Method to insert a node in a tree
  // it moves over the tree to find the location
  // to insert a node with a given id
  insertNode(node, newNode)
  {
    // if the id is less than the node
    // id move left of the tree
      if(newNode.id < node.id)
      {
          // if left is null insert node here
          if(node.left === null)
              node.left = newNode;
          else
              // if left is not null recur until
              // null is found
              this.insertNode(node.left, newNode);
      }
      // if the id is more than the node
      // id move right of the tree
      else
      {
          // if right is null insert node here
          if(node.right === null)
              node.right = newNode;
          else

            // if right is not null recur until
            // null is found
              this.insertNode(node.right,newNode);
        }
    }

// search for a node with given id
  search(node, id)
  {
    console.log("Searching...");
    // if trees is empty return null
      if(node === null) {
        console.log("ID not present")
          return null;
        }
  // if id is less than node's id
  // move left
      else if(id < node.id) {
        console.log("Going left, "+ id +" less than " + node.id);
          return this.search(node.left, id);
        }
    // if id is less than node's id
    // move left
      else if(id > node.id) {
        console.log("Going right, "+ id +" greater than " + node.id);
          return this.search(node.right, id);
        }

    // if id is equal to the node id
    // return node
      else
          return node;
  }


// Returns Root node of tree
  getRootNode(){
    return this.root;
  }


  findMinNode(node)
  {
    // if left of a node is null
    // then it must be minimum node
      if(node.left === null)
          return node;
      else
          return this.findMinNode(node.left);
  }

  findMaxNode(node)
  {
    // if right of a node is null
    // then it must be max node
      if(node.right === null)
          return node;
      else
          return this.findMaxNode(node.right);
  }



}
// getData: Accepts no parameters, returns a tree object
// This function will go out to our hosted CSV file and retreive
// the student data.
function getData(){
  let tree = new BinarySearchTree // create BST
  jQuery.ajax({
    url: "https://raw.githubusercontent.com/mattduranSYS/testingJS/main/data.csv", // Supply URL to CSV file here
    type: 'get', // Getting data
    dataType: 'text', // Data will be text
    async: false,
    success: function(data) { // On Success, run this
        let lines = data.split('\n'); // Find how many lines
        let fields = lines[0].split(','); // Find the columns
        for(let i = 1; i < lines.length; i++){
           let current = lines[i].split(','); // Load current values into an array of 2
           var url = "https://orca.instructure.com/accounts/1/users/"+current[0]
           tree.insert(current[0],current[1],url); // Insert those two data points into the tree
        }
    },
    error: function(jqXHR, textStatus, errorThrow){
        console.log(textStatus); // On failure, run this
      }
  });
    cacheTree(tree);
    return tree
}

function urlWatcher(tree, root){
    // Current page being viewed
    let currentPage = window.location.pathname;
        if(currentPage.includes("gradebook")){ // Gradebook is current page
          elem = document.getElementsByClassName("student-name")
          for(var i = 1; i < elem.length; i++){
            var current = document.getElementsByClassName("student-name")[i]["firstElementChild"]["dataset"]["student_id"]
            var exists = tree.search(root, current);
            if(exists){
                document.getElementsByClassName("student-name")[i].style.border = "thin dotted red"
                document.getElementsByClassName("student-name")[i].style.borderColor = exists.color;
                }
              }
            }
        else if(currentPage.includes("/users/")){ // Users profile page
            var exists = tree.search(root, currentPage.split('/').pop());
            if(exists){
                changeProfile(exists)
              }
        else if(currentPage.includes("2684")){

        } // Attendance book LTI
        else if(currentPage.includes("discussion_topics")){

        } // Discussion topic page
        else if(currentPage.includes("courses")){

        } // Courses people page
  }

function changeProfile(exists){
    var elem = document.getElementsByClassName("profile_table")[0]["rows"]
    var header = document.getElementsByTagName("h2")[0]["innerText"]
    for(var i = 0; i < 3; i++)
        elem[i]["cells"][1]["outerText"].style.color = exists.color;
    header.style.color = exists.color;
    }



function validatePermission(){
    var role = ENV.current_user_types[0].toLowerCase()
    let tree = getTree();
    var root = tree.getRootNode();
    if(role.includes("admin")){
        // do the thing for admins
        urlWatcher(tree, root)
        }
    else if(role.includes("teacher")){
        // do the thing for teachers
        urlWatcher(tree, root)
        }
    else return
}

// Accepts no parameters, returns a tree object
// Checks the current time to either return the tree from local storage
// if within the time to live, or uses the getData function to cache
// and return a new tree.
function getTree(){
  //start by getting the current time
  let d = new Date();
  let now = d.getTime();
  //get the time when the tree was last cached. If not cached, will return null
  let cachedTime = localStorage.getItem('time');
  if (cachedTime !== null) {
    cachedTime = parseInt(cachedTime)
  }
  let ttl = 1000 * 60 * 60;   //time to live in milliseconds
  console.log("current time:  " + now)
  console.log("time to recache: " + (cachedTime + ttl))
  //if no cache, or if now is greather than or equal to the cached time, recache
  if ((cachedTime == null) || (now >= (cachedTime + ttl))) {
    localStorage.clear();
    var tree = getData();
  } else {  //else, get tree from cache
    var tree = getCachedTree();
  }
  return tree;
}

// Accepts a tree as a paramerter and caches it in local storage, alogn within
// the current time.
function cacheTree(tree){
  console.log("Caching tree");
  localStorage.setItem('tree', JSON.stringify(tree)); //cache passed tree
  let d = new Date();
  let time = d.getTime();
  localStorage.setItem('time', time); //cache current time
}

// Gets tree from cache and rebuilds tree from cache into a new tree.
function getCachedTree(){
  console.log("Getting tree from cache");
  let localStorageObject = localStorage.getItem('tree');
  let parsedTree = JSON.parse(localStorageObject);

  let newTree = new BinarySearchTree();
  newTree.root = parsedTree.root;
  rebuildNodes(parsedTree.root, newTree.root);

  return newTree;
}

// Helper function to recur through nodes and define children nodes for new tree
function rebuildNodes(parsedTreeRoot, root) {
  if ((parsedTreeRoot.left !== undefined) && (parsedTreeRoot.left !== null)) {
    root.left = parsedTreeRoot.left;
    rebuildNodes(parsedTreeRoot.left, root.left)
  }
  if ((parsedTreeRoot.right !== undefined) && (parsedTreeRoot.right !== null)) {
    root.right = parsedTreeRoot.right;
    rebuildNodes(parsedTreeRoot.right, root.right)
  }
}
