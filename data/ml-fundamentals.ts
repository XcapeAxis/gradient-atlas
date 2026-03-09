import {
  KnowledgeGraphSchema,
  type CurriculumNode,
  type GraphEdge,
  type Module,
  type RelationType,
  type StarterPath,
} from "@/lib/schema";

function md(...paragraphs: string[]) {
  return paragraphs.join("\n\n");
}

const relationLabels: Record<RelationType, string> = {
  prerequisite_of: "Prerequisite",
  uses: "Uses",
  optimizes: "Optimizes",
  evaluates: "Evaluates",
  regularizes: "Regularizes",
  contrasts_with: "Contrasts",
  example_of: "Example",
  extension_of: "Extension",
};

function edge(
  source: string,
  target: string,
  relationType: RelationType,
  rationale: string,
  label = relationLabels[relationType],
): GraphEdge {
  return {
    id: `${source}__${relationType}__${target}`,
    source,
    target,
    relationType,
    label,
    rationale,
  };
}

const nodes = [
  {
    id: "dataset",
    title: "Dataset",
    shortTitle: "Dataset",
    module: "Foundations",
    summary:
      "A dataset is the collection of examples from which a model learns or is evaluated.",
    intuition:
      "Before talking about algorithms, decide what one row means and which variables are recorded.",
    formalDefinition:
      "A dataset is a finite sample of observations, typically represented as examples x with optional targets y.",
    bodyMarkdown: md(
      "Define the unit of observation first. Splits, preprocessing, and metrics only make sense after the dataset structure is fixed.",
      "A weak dataset definition often hides duplicates, leakage, and mismatched labels.",
    ),
    difficulty: 1,
    estimatedMinutes: 6,
    aliases: ["sample"],
    keyQuestions: [
      "What does one example represent?",
      "Which variables are observed for each example?",
    ],
    formulas: [],
    examples: [
      "One housing example may record size, neighborhood, age, and sale price.",
    ],
    exercisePrompts: [
      "State the unit of observation and columns for a dataset you already know.",
    ],
  },
  {
    id: "features-and-targets",
    title: "Features and Targets",
    shortTitle: "Features & Targets",
    module: "Foundations",
    summary:
      "Supervised learning separates the inputs from the value to predict.",
    intuition:
      "Features are the clues available at prediction time; the target is the answer the model must infer.",
    formalDefinition:
      "Features are measured input variables x and the target is the response y paired with each example.",
    bodyMarkdown: md(
      "Writing down features and target forces clarity about what the model is allowed to know.",
      "Any variable unavailable at prediction time should not be treated as a feature.",
    ),
    difficulty: 1,
    estimatedMinutes: 6,
    aliases: ["predictors and labels"],
    keyQuestions: [
      "Which variables are available before prediction?",
      "What exactly should the model output?",
    ],
    formulas: [],
    examples: [
      "Square footage and location are features when sale price is the target.",
    ],
    exercisePrompts: [
      "Pick a prediction task and list the features and target separately.",
    ],
  },
  {
    id: "supervised-learning",
    title: "Supervised Learning",
    shortTitle: "Supervised",
    module: "Foundations",
    summary:
      "Supervised learning fits a rule from inputs to known targets.",
    intuition:
      "The model learns with an answer key, so every training example says whether a prediction was close or far.",
    formalDefinition:
      "Supervised learning estimates a mapping from inputs x to targets y using labeled examples.",
    bodyMarkdown: md(
      "This setup is used for regression and classification because a target is observed for each example.",
      "The training objective and evaluation metric should both reflect the target type.",
    ),
    difficulty: 1,
    estimatedMinutes: 7,
    aliases: ["supervised ML"],
    keyQuestions: [
      "What target signal guides learning?",
      "How will prediction error be measured?",
    ],
    formulas: [],
    examples: ["Spam filtering learns from emails labeled spam or not spam."],
    exercisePrompts: [
      "Describe one supervised task and name the target variable.",
    ],
  },
  {
    id: "unsupervised-learning",
    title: "Unsupervised Learning",
    shortTitle: "Unsupervised",
    module: "Foundations",
    summary:
      "Unsupervised learning looks for structure without target labels.",
    intuition:
      "There is no answer key, so the method organizes similarity or variation directly from the inputs.",
    formalDefinition:
      "Unsupervised learning estimates latent structure from examples x without paired targets y.",
    bodyMarkdown: md(
      "Because no labels are given, the objective is indirect, such as cluster compactness or retained variance.",
      "Interpretation matters more because different unsupervised objectives reveal different patterns.",
    ),
    difficulty: 1,
    estimatedMinutes: 7,
    aliases: ["unsupervised ML"],
    keyQuestions: [
      "What structure are we trying to reveal?",
      "How will we judge whether the result is useful?",
    ],
    formulas: [],
    examples: [
      "Grouping customers by purchase behavior without predefined segments.",
    ],
    exercisePrompts: [
      "Name one problem that is better framed as unsupervised than supervised.",
    ],
  },
  {
    id: "parameters-and-hyperparameters",
    title: "Parameters and Hyperparameters",
    shortTitle: "Params vs Hyperparams",
    module: "Foundations",
    summary:
      "Parameters are learned from data, while hyperparameters are chosen outside the base fit.",
    intuition:
      "Parameters move during training; hyperparameters set the training rules or model capacity.",
    formalDefinition:
      "Parameters are optimized model values, whereas hyperparameters control model form or training procedure.",
    bodyMarkdown: md(
      "Separating these two makes experiments easier to reason about and compare.",
      "Weights in a model are parameters; choices such as depth, penalty strength, or learning rate are hyperparameters.",
    ),
    difficulty: 2,
    estimatedMinutes: 7,
    aliases: ["params and hyperparams"],
    keyQuestions: [
      "Which values are learned from the objective?",
      "Which values must be selected outside the fit?",
    ],
    formulas: ["theta = parameters, lambda = hyperparameter"],
    examples: [
      "In ridge regression, coefficients are parameters and the penalty weight is a hyperparameter.",
    ],
    exercisePrompts: [
      "List two parameters and two hyperparameters for a model you know.",
    ],
  },
  {
    id: "loss-functions",
    title: "Loss Functions",
    shortTitle: "Loss",
    module: "Foundations",
    summary:
      "A loss function quantifies how bad a prediction is during training.",
    intuition:
      "Training needs a scoreboard that turns model mistakes into a number to reduce.",
    formalDefinition:
      "A loss function L(y, y-hat) maps a target and prediction to a scalar penalty used for optimization.",
    bodyMarkdown: md(
      "Different losses emphasize different kinds of mistakes, so choosing the loss is part of defining the task.",
      "A model can only optimize what the loss makes visible.",
    ),
    difficulty: 2,
    estimatedMinutes: 8,
    aliases: ["objective loss"],
    keyQuestions: [
      "What kinds of mistakes should be penalized most?",
      "Does the training loss match the task objective?",
    ],
    formulas: ["L(y, y-hat)"],
    examples: [
      "Squared loss punishes large regression errors more than small ones.",
    ],
    exercisePrompts: [
      "Give one task where a poor loss choice would steer training in the wrong direction.",
    ],
  },
  {
    id: "optimization",
    title: "Optimization",
    shortTitle: "Optimization",
    module: "Foundations",
    summary:
      "Optimization is the procedure used to find parameter values that improve the training objective.",
    intuition:
      "Once the score is defined, optimization is the search process that tries to make it better.",
    formalDefinition:
      "Optimization seeks parameter values theta-star that minimize or maximize an objective over parameter space.",
    bodyMarkdown: md(
      "Optimization concerns how the search moves through candidate parameter values.",
      "It should be separated from generalization, which asks how the chosen parameters behave on new data.",
    ),
    difficulty: 2,
    estimatedMinutes: 8,
    aliases: ["objective optimization"],
    keyQuestions: [
      "What quantity is being optimized?",
      "How does the algorithm move through parameter space?",
    ],
    formulas: ["theta* = arg min_theta L(theta)"],
    examples: [
      "Gradient descent updates weights repeatedly to lower a loss value.",
    ],
    exercisePrompts: [
      "Explain why lower training loss does not automatically imply better test performance.",
    ],
  },
  {
    id: "train-validation-test-split",
    title: "Train, Validation, and Test Split",
    shortTitle: "Train/Val/Test",
    module: "Data Splits and Leakage",
    summary:
      "Separate data is used for fitting, model selection, and final evaluation.",
    intuition:
      "If the same data decides every choice, your estimate of future performance will be too optimistic.",
    formalDefinition:
      "A train-validation-test split partitions examples so training fits parameters, validation tunes choices, and test estimates final performance.",
    bodyMarkdown: md(
      "The split defines the contract between model building and honest evaluation.",
      "The test set should stay untouched until the modeling process is effectively complete.",
    ),
    difficulty: 1,
    estimatedMinutes: 8,
    aliases: ["holdout split"],
    keyQuestions: [
      "Which subset is used to fit the model?",
      "When should the test set be consulted?",
    ],
    formulas: [],
    examples: [
      "Use 70 percent of rows for training, 15 percent for validation, and 15 percent for test.",
    ],
    exercisePrompts: [
      "Describe how you would use training, validation, and test sets in order.",
    ],
  },
  {
    id: "stratified-sampling",
    title: "Stratified Sampling",
    shortTitle: "Stratified Split",
    module: "Data Splits and Leakage",
    summary:
      "Stratified sampling keeps important label proportions similar across splits.",
    intuition:
      "A rare class can disappear from a small split unless you sample with its frequency in mind.",
    formalDefinition:
      "Stratified sampling partitions data while approximately preserving the distribution of a chosen categorical variable.",
    bodyMarkdown: md(
      "The usual goal is to keep class imbalance stable across training and evaluation subsets.",
      "It is most useful when a class is rare enough that plain random splitting would distort the label mix.",
    ),
    difficulty: 2,
    estimatedMinutes: 7,
    aliases: ["stratified split"],
    keyQuestions: [
      "Which distribution should be preserved across splits?",
      "Would a plain random split distort a rare class?",
    ],
    formulas: [],
    examples: [
      "A fraud dataset with one percent positives is often split with label stratification.",
    ],
    exercisePrompts: [
      "Explain when stratification matters more than pure random sampling.",
    ],
  },
  {
    id: "cross-validation",
    title: "Cross-Validation",
    shortTitle: "Cross-Validation",
    module: "Data Splits and Leakage",
    summary:
      "Cross-validation repeats fitting and evaluation across multiple data folds.",
    intuition:
      "Instead of trusting one split, rotate the validation role so performance depends less on a lucky partition.",
    formalDefinition:
      "Cross-validation estimates model performance by training and evaluating across repeated partitions of the data, such as k folds.",
    bodyMarkdown: md(
      "Cross-validation is commonly used for model comparison and hyperparameter selection when data is limited.",
      "It is not a substitute for a final untouched test set when a final estimate still matters.",
    ),
    difficulty: 2,
    estimatedMinutes: 9,
    aliases: ["k-fold CV"],
    keyQuestions: [
      "Why might one split be a noisy estimate?",
      "What decision is cross-validation helping you make?",
    ],
    formulas: ["CV score = (1/k) sum fold scores"],
    examples: [
      "Five-fold cross-validation trains five models, each leaving out a different fifth of the data.",
    ],
    exercisePrompts: [
      "Describe how five-fold cross-validation reuses the dataset across folds.",
    ],
  },
  {
    id: "data-leakage",
    title: "Data Leakage",
    shortTitle: "Leakage",
    module: "Data Splits and Leakage",
    summary:
      "Data leakage occurs when information from outside the training contract sneaks into model fitting.",
    intuition:
      "A model can seem excellent because it was given hints that would not exist at prediction time.",
    formalDefinition:
      "Data leakage is any contamination of training or model selection with information unavailable under the intended deployment setting.",
    bodyMarkdown: md(
      "Leakage often comes from using future information, target-derived features, or preprocessing fitted on all rows before the split.",
      "It inflates validation scores while hiding real deployment error.",
    ),
    difficulty: 2,
    estimatedMinutes: 8,
    aliases: ["target leakage"],
    keyQuestions: [
      "What information would be unavailable when predicting on new data?",
      "Was any preprocessing fitted before the split was applied?",
    ],
    formulas: [],
    examples: [
      "Including a loan default flag derived after approval would leak future information into approval prediction.",
    ],
    exercisePrompts: [
      "Name one feature that would create leakage in a time-ordered prediction problem.",
    ],
  },
  {
    id: "preprocessing-pipeline",
    title: "Preprocessing Pipeline",
    shortTitle: "Pipeline",
    module: "Data Splits and Leakage",
    summary:
      "A preprocessing pipeline applies data transformations in a controlled training-and-inference order.",
    intuition:
      "Put scaling, encoding, and similar steps into one repeatable chain so the same rules apply everywhere.",
    formalDefinition:
      "A preprocessing pipeline is an ordered composition of fitted and unfitted transformations applied consistently across training and inference data.",
    bodyMarkdown: md(
      "Pipelines reduce leakage because each transformation is fit on the training portion and then applied to validation or test data with frozen parameters.",
      "They also make experiments more reproducible.",
    ),
    difficulty: 2,
    estimatedMinutes: 8,
    aliases: ["feature pipeline"],
    keyQuestions: [
      "Which transforms need fitted statistics from training data?",
      "Can the exact same sequence be applied at inference time?",
    ],
    formulas: [],
    examples: [
      "Standardization followed by one-hot encoding and then a classifier is a common pipeline.",
    ],
    exercisePrompts: [
      "Write the ordered preprocessing steps you would place in a pipeline for tabular data.",
    ],
  },
  {
    id: "temporal-split",
    title: "Temporal Split",
    shortTitle: "Temporal Split",
    module: "Data Splits and Leakage",
    summary:
      "A temporal split respects time order by training on earlier data and evaluating on later data.",
    intuition:
      "If the future predicts the past in your experiment, the experiment does not match deployment.",
    formalDefinition:
      "A temporal split partitions examples by time so that training observations precede validation and test observations.",
    bodyMarkdown: md(
      "Time-ordered problems need evaluation that preserves chronology, especially when behavior drifts.",
      "A random split can accidentally leak future conditions into the training set.",
    ),
    difficulty: 2,
    estimatedMinutes: 7,
    aliases: ["time-based split"],
    keyQuestions: [
      "Would a random split mix future information into training?",
      "Does the deployment setting require prediction into a later time window?",
    ],
    formulas: [],
    examples: [
      "Train on months one through nine and test on months ten through twelve.",
    ],
    exercisePrompts: [
      "Explain why a temporal split is safer than a random split for demand forecasting.",
    ],
  },
  {
    id: "linear-regression",
    title: "Linear Regression",
    shortTitle: "Linear Regression",
    module: "Linear Models and Optimization",
    summary:
      "Linear regression predicts a numeric target with a weighted sum of the inputs.",
    intuition:
      "It fits the straight-line relationship that best balances errors under the chosen loss.",
    formalDefinition:
      "Linear regression models a target as y-hat = w-transpose x plus b for continuous outcomes.",
    bodyMarkdown: md(
      "A linear model is often the first baseline because its assumptions and coefficients are easy to inspect.",
      "When it misses badly, the residual pattern often reveals what extra structure is missing.",
    ),
    difficulty: 2,
    estimatedMinutes: 10,
    aliases: ["OLS"],
    keyQuestions: [
      "Is the target numeric and continuous?",
      "Would a linear baseline reveal useful signal before trying a more flexible model?",
    ],
    formulas: ["y-hat = w^T x + b"],
    examples: [
      "Predict apartment rent from size, location score, and building age.",
    ],
    exercisePrompts: [
      "Name one regression target and explain why a linear baseline is informative.",
    ],
  },
  {
    id: "logistic-regression",
    title: "Logistic Regression",
    shortTitle: "Logistic Regression",
    module: "Linear Models and Optimization",
    summary:
      "Logistic regression predicts class probability with a linear score passed through a sigmoid.",
    intuition:
      "It keeps a linear decision rule but converts that score into a value between zero and one.",
    formalDefinition:
      "Logistic regression models the conditional probability of a class as sigma of w-transpose x plus b.",
    bodyMarkdown: md(
      "Despite the name, logistic regression is usually taught as a classification model.",
      "Its probabilities make thresholding, ranking, and calibration analysis convenient.",
    ),
    difficulty: 2,
    estimatedMinutes: 10,
    aliases: ["logit model"],
    keyQuestions: [
      "Is the task binary classification or a binary one-vs-rest subproblem?",
      "Do you need a simple probability model with interpretable coefficients?",
    ],
    formulas: ["P(y=1|x) = sigma(w^T x + b)"],
    examples: [
      "Predict whether a user will click an ad based on profile and context features.",
    ],
    exercisePrompts: [
      "Explain why logistic regression can be a strong baseline for binary classification.",
    ],
  },
  {
    id: "linear-decision-boundary",
    title: "Linear Decision Boundary",
    shortTitle: "Linear Boundary",
    module: "Linear Models and Optimization",
    summary:
      "A linear decision boundary separates classes with a hyperplane.",
    intuition:
      "The model draws one flat dividing surface and classifies points by which side they land on.",
    formalDefinition:
      "A linear decision boundary is the set of points x satisfying w-transpose x plus b equals zero.",
    bodyMarkdown: md(
      "Linear boundaries are simple and stable, but they cannot bend around curved class structure.",
      "This limitation is useful because it makes errors easy to inspect.",
    ),
    difficulty: 2,
    estimatedMinutes: 7,
    aliases: ["hyperplane boundary"],
    keyQuestions: [
      "Can a single hyperplane separate the classes well enough?",
      "What patterns in the data violate a linear boundary assumption?",
    ],
    formulas: ["w^T x + b = 0"],
    examples: [
      "Two exam scores can be separated by a straight line into likely pass and fail regions.",
    ],
    exercisePrompts: [
      "Sketch a case where a linear boundary would fail to separate the classes cleanly.",
    ],
  },
  {
    id: "gradient-descent",
    title: "Gradient Descent",
    shortTitle: "Gradient Descent",
    module: "Linear Models and Optimization",
    summary:
      "Gradient descent updates parameters in the direction that lowers the objective.",
    intuition:
      "It repeatedly takes a small downhill step on the loss surface.",
    formalDefinition:
      "Gradient descent updates parameters by subtracting a learning-rate-scaled gradient of the objective.",
    bodyMarkdown: md(
      "The size and stability of each step depend on both the gradient and the learning rate.",
      "The same core idea appears far beyond linear models, including neural networks.",
    ),
    difficulty: 2,
    estimatedMinutes: 9,
    aliases: ["GD"],
    keyQuestions: [
      "What gradient is being computed at each step?",
      "How large should each update be?",
    ],
    formulas: ["theta_(t+1) = theta_t - eta grad L(theta_t)"],
    examples: [
      "Each pass over mini-batches nudges weights to reduce classification loss.",
    ],
    exercisePrompts: [
      "Describe what could happen if the update step is repeatedly too large.",
    ],
  },
  {
    id: "learning-rate",
    title: "Learning Rate",
    shortTitle: "Learning Rate",
    module: "Linear Models and Optimization",
    summary:
      "The learning rate controls the step size in gradient-based optimization.",
    intuition:
      "Too small is painfully slow; too large can bounce past a good region.",
    formalDefinition:
      "The learning rate eta scales the gradient update magnitude in iterative optimization methods.",
    bodyMarkdown: md(
      "Step size strongly affects optimization speed and stability.",
      "A useful schedule often starts with a workable scale and then reduces it as training settles.",
    ),
    difficulty: 2,
    estimatedMinutes: 6,
    aliases: ["step size"],
    keyQuestions: [
      "Is the optimizer converging too slowly?",
      "Are updates unstable or oscillatory?",
    ],
    formulas: ["eta"],
    examples: [
      "A very large learning rate can make training loss jump up and down instead of decreasing.",
    ],
    exercisePrompts: [
      "Explain how you would diagnose an overly large learning rate from a training curve.",
    ],
  },
  {
    id: "feature-scaling",
    title: "Feature Scaling",
    shortTitle: "Feature Scaling",
    module: "Linear Models and Optimization",
    summary:
      "Feature scaling rescales numeric inputs to comparable ranges.",
    intuition:
      "If one feature is measured in thousands and another in tenths, optimization may be dominated by the larger scale.",
    formalDefinition:
      "Feature scaling applies a deterministic transformation, such as standardization or normalization, to numeric features before modeling.",
    bodyMarkdown: md(
      "Scaling is especially important for distance-based methods and gradient-based optimization.",
      "The statistics used for scaling must be fit on training data only.",
    ),
    difficulty: 1,
    estimatedMinutes: 6,
    aliases: ["standardization"],
    keyQuestions: [
      "Are feature magnitudes wildly different?",
      "Does the algorithm depend on distance or gradient step geometry?",
    ],
    formulas: ["z = (x - mu) / sigma"],
    examples: [
      "Age measured in years and income measured in dollars often benefit from standardization.",
    ],
    exercisePrompts: [
      "Give one model family that cares a lot about scaling and one that usually cares less.",
    ],
  },
  {
    id: "regularization",
    title: "Regularization",
    shortTitle: "Regularization",
    module: "Linear Models and Optimization",
    summary:
      "Regularization adds a preference for simpler solutions to reduce overfitting.",
    intuition:
      "When a model fits noise too eagerly, regularization pushes it toward more restrained parameter values.",
    formalDefinition:
      "Regularization augments an objective with a complexity penalty or constraint on model parameters.",
    bodyMarkdown: md(
      "Regularization changes the optimization target so some solutions become less attractive even if they fit training data better.",
      "The right strength is usually chosen with validation rather than guessed once.",
    ),
    difficulty: 3,
    estimatedMinutes: 9,
    aliases: ["penalty term"],
    keyQuestions: [
      "Is the model too flexible relative to the data size?",
      "How will penalty strength be selected?",
    ],
    formulas: ["L_reg = L_data + lambda Omega(theta)"],
    examples: [
      "Ridge regression adds a penalty that shrinks large coefficients.",
    ],
    exercisePrompts: [
      "Explain why stronger regularization can improve test performance even if training error rises.",
    ],
  },
  {
    id: "l1-vs-l2-regularization",
    title: "L1 versus L2 Regularization",
    shortTitle: "L1 vs L2",
    module: "Linear Models and Optimization",
    summary:
      "L1 and L2 penalties both constrain model size, but they shape solutions differently.",
    intuition:
      "L1 tends to create sparse solutions, while L2 tends to spread shrinkage across many weights.",
    formalDefinition:
      "L1 regularization penalizes the absolute sum of coefficients, whereas L2 regularization penalizes the squared sum of coefficients.",
    bodyMarkdown: md(
      "The penalty geometry changes which parameter vectors are favored.",
      "This matters when interpretability, sparsity, or stability is more important than pure fit.",
    ),
    difficulty: 3,
    estimatedMinutes: 8,
    aliases: ["lasso vs ridge"],
    keyQuestions: [
      "Do you want sparse feature selection or smooth shrinkage?",
      "How sensitive is the model to correlated features?",
    ],
    formulas: ["L1: lambda sum |w_j|", "L2: lambda sum w_j^2"],
    examples: [
      "L1 may drive some coefficients to zero, while L2 usually only shrinks them.",
    ],
    exercisePrompts: [
      "State one reason to prefer L1 and one reason to prefer L2.",
    ],
  },
  {
    id: "mean-squared-error",
    title: "Mean Squared Error",
    shortTitle: "MSE",
    module: "Evaluation and Generalization",
    summary:
      "Mean squared error averages squared regression residuals.",
    intuition:
      "Large misses matter a lot because squaring makes them dominate the average.",
    formalDefinition:
      "Mean squared error is the average of squared differences between predicted and observed continuous targets.",
    bodyMarkdown: md(
      "MSE is common for regression because it is simple, differentiable, and sensitive to large errors.",
      "That same sensitivity makes it less robust to outliers than absolute-error-based choices.",
    ),
    difficulty: 2,
    estimatedMinutes: 7,
    aliases: ["squared loss"],
    keyQuestions: [
      "Are large residuals especially costly in this task?",
      "How sensitive is the metric to outliers?",
    ],
    formulas: ["MSE = (1/n) sum (y_i - y-hat_i)^2"],
    examples: [
      "A few very bad house-price predictions can dominate the total MSE.",
    ],
    exercisePrompts: [
      "Explain why squaring residuals changes how the metric responds to outliers.",
    ],
  },
  {
    id: "classification-accuracy",
    title: "Classification Accuracy",
    shortTitle: "Accuracy",
    module: "Evaluation and Generalization",
    summary:
      "Accuracy is the fraction of predictions whose class labels are correct.",
    intuition:
      "It answers the simplest question: how often did the model guess the label right?",
    formalDefinition:
      "Classification accuracy is the number of correct class predictions divided by the total number of predictions.",
    bodyMarkdown: md(
      "Accuracy is easy to explain but can be misleading on imbalanced data.",
      "A model that predicts the majority class every time may score well while being useless for the rare class.",
    ),
    difficulty: 1,
    estimatedMinutes: 5,
    aliases: ["top-1 accuracy"],
    keyQuestions: [
      "Is class imbalance severe enough to hide weak minority-class performance?",
      "Is a hard class decision the main quantity you care about?",
    ],
    formulas: ["Accuracy = correct / total"],
    examples: [
      "On a dataset with 99 percent negatives, always predicting negative gives 99 percent accuracy.",
    ],
    exercisePrompts: [
      "Describe a case where accuracy is high but the model is still poor.",
    ],
  },
  {
    id: "precision-recall-f1",
    title: "Precision, Recall, and F1",
    shortTitle: "Precision/Recall/F1",
    module: "Evaluation and Generalization",
    summary:
      "Precision and recall separate false alarms from misses, while F1 balances the two.",
    intuition:
      "Some tasks care more about catching positives; others care more about avoiding false alerts.",
    formalDefinition:
      "Precision is TP over TP plus FP, recall is TP over TP plus FN, and F1 is their harmonic mean.",
    bodyMarkdown: md(
      "These metrics are especially useful when the positive class is rare or costly.",
      "They force you to say whether false positives and false negatives matter differently.",
    ),
    difficulty: 2,
    estimatedMinutes: 8,
    aliases: ["PR metrics"],
    keyQuestions: [
      "Which is costlier here: a false positive or a false negative?",
      "Does a single accuracy score hide the trade-off you actually care about?",
    ],
    formulas: [
      "Precision = TP / (TP + FP)",
      "Recall = TP / (TP + FN)",
      "F1 = 2PR / (P + R)",
    ],
    examples: [
      "Medical screening often prioritizes recall so fewer true cases are missed.",
    ],
    exercisePrompts: [
      "Give one task where precision matters more and one where recall matters more.",
    ],
  },
  {
    id: "roc-auc",
    title: "ROC AUC",
    shortTitle: "ROC AUC",
    module: "Evaluation and Generalization",
    summary:
      "ROC AUC measures how well a scoring model ranks positives above negatives across thresholds.",
    intuition:
      "Instead of fixing one threshold, ROC AUC asks whether positives usually receive higher scores than negatives.",
    formalDefinition:
      "ROC AUC is the area under the receiver operating characteristic curve relating true positive rate to false positive rate.",
    bodyMarkdown: md(
      "ROC AUC is threshold-free, which is useful when the final operating point is not fixed yet.",
      "It is less informative when the deployed system only cares about a narrow part of the ranking range.",
    ),
    difficulty: 3,
    estimatedMinutes: 8,
    aliases: ["AUC"],
    keyQuestions: [
      "Do you care about ranking quality across thresholds?",
      "Would a threshold-specific metric be more aligned with deployment?",
    ],
    formulas: ["AUC = area under TPR versus FPR curve"],
    examples: [
      "Two models may have similar accuracy but very different AUC because one ranks positives more reliably.",
    ],
    exercisePrompts: [
      "Explain why ROC AUC can change even when a fixed-threshold accuracy score does not.",
    ],
  },
  {
    id: "overfitting-and-underfitting",
    title: "Overfitting and Underfitting",
    shortTitle: "Over/Underfit",
    module: "Evaluation and Generalization",
    summary:
      "Overfitting memorizes noise, while underfitting misses important structure.",
    intuition:
      "A model can be too simple to learn the signal or too eager to chase quirks in the training set.",
    formalDefinition:
      "Underfitting reflects high training error from insufficient model flexibility, whereas overfitting reflects a harmful train-test performance gap.",
    bodyMarkdown: md(
      "This is one of the core lenses for debugging model behavior.",
      "Training and validation curves are often the fastest way to see which side of the problem you are on.",
    ),
    difficulty: 2,
    estimatedMinutes: 8,
    aliases: ["fit diagnostics"],
    keyQuestions: [
      "Is training performance already poor, or is the gap to validation the main issue?",
      "Would more capacity or more restraint help?",
    ],
    formulas: [],
    examples: [
      "A deep tree may fit every training row perfectly but perform worse on new data.",
    ],
    exercisePrompts: [
      "Describe one sign of underfitting and one sign of overfitting.",
    ],
  },
  {
    id: "bias-variance-tradeoff",
    title: "Bias-Variance Trade-off",
    shortTitle: "Bias-Variance",
    module: "Evaluation and Generalization",
    summary:
      "Generalization error can be understood as a balance between systematic error and sensitivity to sampling noise.",
    intuition:
      "Simple models can miss the pattern; very flexible models can chase the sample too closely.",
    formalDefinition:
      "The bias-variance trade-off describes how expected prediction error depends on both approximation bias and estimator variance.",
    bodyMarkdown: md(
      "The trade-off is a mental model, not a single formula you optimize directly in day-to-day practice.",
      "It helps explain why tuning capacity and regularization changes validation behavior.",
    ),
    difficulty: 3,
    estimatedMinutes: 9,
    aliases: ["bias variance"],
    keyQuestions: [
      "Is the model too rigid or too unstable across samples?",
      "Which change would lower variance without destroying the signal?",
    ],
    formulas: [
      "Expected error = bias^2 + variance + irreducible noise",
    ],
    examples: [
      "Bagging reduces variance by averaging many noisy trees.",
    ],
    exercisePrompts: [
      "Explain how stronger regularization changes bias and variance qualitatively.",
    ],
  },
  {
    id: "calibration",
    title: "Calibration",
    shortTitle: "Calibration",
    module: "Evaluation and Generalization",
    summary:
      "Calibration asks whether predicted probabilities match observed frequencies.",
    intuition:
      "If a model says 0.8 often, about 80 percent of those cases should truly be positive.",
    formalDefinition:
      "A probabilistic classifier is calibrated when predicted probabilities align with empirical event frequencies.",
    bodyMarkdown: md(
      "Calibration matters when probabilities drive downstream decisions, not just class labels.",
      "A model can rank cases well and still be poorly calibrated.",
    ),
    difficulty: 3,
    estimatedMinutes: 8,
    aliases: ["probability calibration"],
    keyQuestions: [
      "Are predicted probabilities used directly in a decision rule?",
      "Does good ranking quality also need probability trustworthiness here?",
    ],
    formulas: ["P(Y=1 | p-hat = p) = p"],
    examples: [
      "Risk scores used for triage need meaningful probabilities, not only a correct ranking.",
    ],
    exercisePrompts: [
      "Give one use case where calibration matters more than top-line accuracy.",
    ],
  },
  {
    id: "decision-tree",
    title: "Decision Tree",
    shortTitle: "Decision Tree",
    module: "Trees and Ensembles",
    summary:
      "A decision tree makes predictions by recursively splitting the feature space.",
    intuition:
      "Each split asks a simple question, and the sequence of answers routes an example to a leaf prediction.",
    formalDefinition:
      "A decision tree partitions input space into regions by repeated feature-based splits and assigns a prediction to each terminal node.",
    bodyMarkdown: md(
      "Trees are attractive because they capture nonlinear interactions with simple rule-like structure.",
      "Unconstrained trees can overfit quickly, so stopping rules and pruning matter.",
    ),
    difficulty: 2,
    estimatedMinutes: 9,
    aliases: ["CART"],
    keyQuestions: [
      "What split criterion is choosing each branch?",
      "How deep should the tree be allowed to grow?",
    ],
    formulas: [],
    examples: [
      "A lending tree might first split on income, then on existing debt, then on delinquency history.",
    ],
    exercisePrompts: [
      "Explain why a tree can model interactions without manual feature crosses.",
    ],
  },
  {
    id: "impurity-measures",
    title: "Impurity Measures",
    shortTitle: "Impurity",
    module: "Trees and Ensembles",
    summary:
      "Impurity measures score how mixed a node is and guide tree splits.",
    intuition:
      "Good splits make child nodes more pure than the parent node.",
    formalDefinition:
      "Impurity measures, such as Gini impurity or entropy, quantify class heterogeneity inside a node.",
    bodyMarkdown: md(
      "A split is attractive when it reduces impurity substantially in the children.",
      "Different impurity measures often lead to similar trees but can emphasize uncertainty slightly differently.",
    ),
    difficulty: 2,
    estimatedMinutes: 7,
    aliases: ["Gini and entropy"],
    keyQuestions: [
      "What makes one candidate split better than another?",
      "How is class mixture quantified at a node?",
    ],
    formulas: ["Gini = 1 - sum p_k^2", "Entropy = -sum p_k log p_k"],
    examples: [
      "A node with half positives and half negatives is more impure than a node with mostly one class.",
    ],
    exercisePrompts: [
      "State which node is more impure: 50-50 class mix or 90-10 class mix.",
    ],
  },
  {
    id: "tree-depth-and-pruning",
    title: "Tree Depth and Pruning",
    shortTitle: "Depth & Pruning",
    module: "Trees and Ensembles",
    summary:
      "Depth limits and pruning control tree complexity.",
    intuition:
      "If a tree keeps splitting until every training corner is isolated, it will usually memorize noise.",
    formalDefinition:
      "Depth constraints and pruning rules regularize tree models by limiting or removing splits that do not justify their complexity.",
    bodyMarkdown: md(
      "Depth is a direct capacity control for trees and for tree-based ensembles built from shallow learners.",
      "Pruning removes weak branches after or during growth to improve generalization.",
    ),
    difficulty: 2,
    estimatedMinutes: 7,
    aliases: ["tree pruning"],
    keyQuestions: [
      "How deep can the tree grow before validation performance degrades?",
      "Which branches add complexity without enough gain?",
    ],
    formulas: [],
    examples: [
      "A max-depth of three can keep a tree broad and interpretable compared with a fully grown tree.",
    ],
    exercisePrompts: [
      "Explain why shallower trees often generalize better than unrestricted trees.",
    ],
  },
  {
    id: "random-forest",
    title: "Random Forest",
    shortTitle: "Random Forest",
    module: "Trees and Ensembles",
    summary:
      "A random forest averages many randomized trees to reduce variance.",
    intuition:
      "One tree can be unstable, but averaging many diverse trees makes the prediction steadier.",
    formalDefinition:
      "A random forest is an ensemble of decision trees trained on bootstrap samples with feature subsampling at splits.",
    bodyMarkdown: md(
      "Bagging lowers variance by averaging noisy learners that make slightly different mistakes.",
      "Random feature selection decorrelates trees so averaging is more effective.",
    ),
    difficulty: 3,
    estimatedMinutes: 10,
    aliases: ["bagged trees"],
    keyQuestions: [
      "Why does averaging trees help generalization?",
      "How does randomness increase ensemble diversity?",
    ],
    formulas: [],
    examples: [
      "A forest may outperform one deep tree on tabular data because the average prediction is less noisy.",
    ],
    exercisePrompts: [
      "Describe the two main sources of randomness in a standard random forest.",
    ],
  },
  {
    id: "gradient-boosted-trees",
    title: "Gradient-Boosted Trees",
    shortTitle: "Boosted Trees",
    module: "Trees and Ensembles",
    summary:
      "Gradient-boosted trees build an ensemble sequentially to correct earlier residual errors.",
    intuition:
      "Instead of averaging independent trees, boosting adds trees one by one where the current model is still weak.",
    formalDefinition:
      "Gradient boosting fits additive trees in sequence, each trained to reduce the current objective or residual error.",
    bodyMarkdown: md(
      "Boosting is often strong on structured tabular data because it refines errors stage by stage.",
      "Its performance depends heavily on depth, learning rate, and the number of boosting rounds.",
    ),
    difficulty: 3,
    estimatedMinutes: 11,
    aliases: ["GBDT"],
    keyQuestions: [
      "How is each new tree targeting the current residual pattern?",
      "Which hyperparameters control stage size and total complexity?",
    ],
    formulas: ["F_m(x) = F_(m-1)(x) + eta h_m(x)"],
    examples: [
      "A boosted tree model may add a shallow tree focused on cases where the earlier trees still underpredict.",
    ],
    exercisePrompts: [
      "Explain how boosting differs from averaging independent trees.",
    ],
  },
  {
    id: "feature-importance",
    title: "Feature Importance",
    shortTitle: "Feature Importance",
    module: "Trees and Ensembles",
    summary:
      "Feature importance scores summarize how much a model relies on each input variable.",
    intuition:
      "They answer which columns the model seems to lean on most, but not always why.",
    formalDefinition:
      "Feature importance is any quantitative attribution of predictive contribution to input variables, such as impurity reduction or permutation impact.",
    bodyMarkdown: md(
      "Importance scores are descriptive summaries, not direct proof of causality.",
      "They are most useful when combined with domain knowledge and checks for leakage or correlated features.",
    ),
    difficulty: 2,
    estimatedMinutes: 7,
    aliases: ["variable importance"],
    keyQuestions: [
      "How was importance computed for this model?",
      "Could correlated features or leakage distort the ranking?",
    ],
    formulas: [],
    examples: [
      "A tree ensemble may rank account age above region if it drives many profitable splits.",
    ],
    exercisePrompts: [
      "Name one reason a high importance score does not prove causal influence.",
    ],
  },
  {
    id: "clustering",
    title: "Clustering",
    shortTitle: "Clustering",
    module: "Unsupervised Learning",
    summary:
      "Clustering groups examples by similarity without target labels.",
    intuition:
      "The algorithm tries to place similar points together and separate dissimilar ones.",
    formalDefinition:
      "Clustering is an unsupervised task that assigns observations to groups according to a chosen similarity or distance notion.",
    bodyMarkdown: md(
      "There is no single correct clustering because the notion of similarity comes from the modeling choice.",
      "A useful clustering is one whose group structure helps an actual downstream decision or explanation.",
    ),
    difficulty: 2,
    estimatedMinutes: 8,
    aliases: ["unsupervised grouping"],
    keyQuestions: [
      "What similarity notion makes sense for this data?",
      "How will the resulting groups be used or interpreted?",
    ],
    formulas: [],
    examples: [
      "Retail customers can be grouped by purchasing patterns to support segmentation.",
    ],
    exercisePrompts: [
      "Describe one situation where clustering is useful even though no labels exist.",
    ],
  },
  {
    id: "k-means",
    title: "K-Means",
    shortTitle: "K-Means",
    module: "Unsupervised Learning",
    summary:
      "K-means partitions data into k clusters by alternating assignments and centroid updates.",
    intuition:
      "Each cluster is summarized by a center, and points are assigned to the nearest center.",
    formalDefinition:
      "K-means minimizes within-cluster squared distance to cluster centroids over a fixed number of clusters k.",
    bodyMarkdown: md(
      "K-means is simple and fast, but it assumes distance is meaningful and cluster shapes are roughly centroid-based.",
      "Initialization and feature scaling can materially change the result.",
    ),
    difficulty: 2,
    estimatedMinutes: 9,
    aliases: ["centroid clustering"],
    keyQuestions: [
      "Is Euclidean distance a sensible similarity measure here?",
      "How sensitive is the result to initialization and scaling?",
    ],
    formulas: ["sum ||x_i - mu_c(i)||^2"],
    examples: [
      "Customer records can be assigned to the nearest spending-profile centroid.",
    ],
    exercisePrompts: [
      "Explain why scaling matters before applying k-means.",
    ],
  },
  {
    id: "hierarchical-clustering",
    title: "Hierarchical Clustering",
    shortTitle: "Hierarchical",
    module: "Unsupervised Learning",
    summary:
      "Hierarchical clustering builds a nested grouping structure rather than one flat partition only.",
    intuition:
      "Instead of choosing one grouping immediately, it reveals how clusters merge or split across scales.",
    formalDefinition:
      "Hierarchical clustering constructs a dendrogram by recursively merging or dividing clusters according to a linkage rule.",
    bodyMarkdown: md(
      "The tree view is useful when group structure may exist at several granularities.",
      "The chosen linkage criterion strongly influences which clusters merge early.",
    ),
    difficulty: 3,
    estimatedMinutes: 8,
    aliases: ["dendrogram clustering"],
    keyQuestions: [
      "Do you need a nested view of grouping rather than only one partition?",
      "Which linkage rule best matches your similarity notion?",
    ],
    formulas: [],
    examples: [
      "Documents can be clustered into topics and subtopics using a dendrogram.",
    ],
    exercisePrompts: [
      "State one advantage of hierarchical clustering over k-means.",
    ],
  },
  {
    id: "dimensionality-reduction",
    title: "Dimensionality Reduction",
    shortTitle: "Dimensionality Reduction",
    module: "Unsupervised Learning",
    summary:
      "Dimensionality reduction compresses many variables into a smaller representation.",
    intuition:
      "If several features move together, a lower-dimensional summary may keep most of the useful structure.",
    formalDefinition:
      "Dimensionality reduction maps observations from a high-dimensional space to a lower-dimensional one while preserving selected structure.",
    bodyMarkdown: md(
      "Lower-dimensional representations can simplify visualization, denoise data, or speed later models.",
      "The price is that some information is intentionally discarded.",
    ),
    difficulty: 2,
    estimatedMinutes: 8,
    aliases: ["dimension reduction"],
    keyQuestions: [
      "What structure must be preserved in the lower-dimensional view?",
      "Is the lost information acceptable for the downstream task?",
    ],
    formulas: [],
    examples: [
      "Thousands of pixel features can be reduced before plotting or clustering images.",
    ],
    exercisePrompts: [
      "Give one reason to reduce dimensionality before visualization.",
    ],
  },
  {
    id: "principal-component-analysis",
    title: "Principal Component Analysis",
    shortTitle: "PCA",
    module: "Unsupervised Learning",
    summary:
      "PCA finds orthogonal directions that capture as much variance as possible.",
    intuition:
      "It rotates the coordinate system so the first few axes explain the biggest swings in the data.",
    formalDefinition:
      "Principal component analysis projects centered data onto orthogonal directions of maximal variance.",
    bodyMarkdown: md(
      "PCA is a classic linear reduction method and a common first pass for compression or visualization.",
      "Because it is variance-based, scaling and centering choices matter.",
    ),
    difficulty: 3,
    estimatedMinutes: 10,
    aliases: ["principal components"],
    keyQuestions: [
      "Have the numeric features been centered and scaled appropriately?",
      "How many components retain enough structure for the task?",
    ],
    formulas: ["X approx U_k S_k V_k^T"],
    examples: [
      "Many correlated financial indicators can be summarized by a few principal components.",
    ],
    exercisePrompts: [
      "Explain why one very large-scale feature can dominate PCA if scaling is skipped.",
    ],
  },
  {
    id: "anomaly-detection",
    title: "Anomaly Detection",
    shortTitle: "Anomaly Detection",
    module: "Unsupervised Learning",
    summary:
      "Anomaly detection identifies observations that look unusual relative to normal patterns.",
    intuition:
      "Rare points or behaviors may matter precisely because they do not resemble the bulk of the data.",
    formalDefinition:
      "Anomaly detection estimates whether an observation is unlikely under the typical data distribution or local neighborhood structure.",
    bodyMarkdown: md(
      "The challenge is that truly anomalous cases are rare and often poorly labeled.",
      "Methods vary from distance-based rules to density estimates and reconstruction-based scores.",
    ),
    difficulty: 3,
    estimatedMinutes: 8,
    aliases: ["outlier detection"],
    keyQuestions: [
      "What does normal behavior look like in this domain?",
      "Are anomalies global, local, or time-dependent?",
    ],
    formulas: [],
    examples: [
      "A monitoring system may flag machines whose sensor readings drift far from the usual operating pattern.",
    ],
    exercisePrompts: [
      "Describe one domain where anomaly detection is more natural than standard classification.",
    ],
  },
  {
    id: "neural-networks-preview",
    title: "Neural Networks (Preview)",
    shortTitle: "NN Preview",
    module: "Neural Networks (Preview)",
    summary:
      "Neural networks stack learned transformations to model more complex input-output relationships.",
    intuition:
      "They keep the same basic training ingredients as linear models but add layers of intermediate computation.",
    formalDefinition:
      "A neural network composes affine transformations and nonlinear activations into a parameterized function learned from data.",
    bodyMarkdown: md(
      "This node is a gateway preview rather than a full module.",
      "It connects familiar ideas such as parameters, gradient descent, scaling, and probabilistic classification to a richer model family.",
    ),
    difficulty: 3,
    estimatedMinutes: 9,
    aliases: ["feedforward network"],
    keyQuestions: [
      "Which familiar ideas from linear models still apply here?",
      "What extra flexibility do learned hidden layers provide?",
    ],
    formulas: ["a = sigma(Wx + b)"],
    examples: [
      "An image classifier can learn multiple hidden representations before producing class probabilities.",
    ],
    exercisePrompts: [
      "Name two concepts from earlier modules that still matter when training a neural network.",
    ],
  },
] satisfies CurriculumNode[];

const edges = [
  edge("dataset", "features-and-targets", "prerequisite_of", "You must define the observed columns before separating inputs from outputs."),
  edge("dataset", "supervised-learning", "prerequisite_of", "Supervised learning assumes a dataset of examples paired with targets."),
  edge("dataset", "unsupervised-learning", "prerequisite_of", "Unsupervised learning still starts from a well-defined collection of examples."),
  edge("features-and-targets", "supervised-learning", "prerequisite_of", "Supervised learning only makes sense after inputs and targets are separated."),
  edge("supervised-learning", "unsupervised-learning", "contrasts_with", "The main distinction is whether labeled targets are available during learning."),
  edge("parameters-and-hyperparameters", "learning-rate", "prerequisite_of", "The learning rate is a hyperparameter, so the distinction should be clear first."),
  edge("parameters-and-hyperparameters", "regularization", "prerequisite_of", "Regularization strength is chosen as a hyperparameter while parameters are still learned."),
  edge("loss-functions", "optimization", "prerequisite_of", "Optimization cannot start until the objective to improve is specified."),
  edge("gradient-descent", "optimization", "example_of", "Gradient descent is a standard instance of an optimization procedure."),
  edge("mean-squared-error", "loss-functions", "example_of", "Mean squared error is a common loss choice for regression."),
  edge("train-validation-test-split", "cross-validation", "contrasts_with", "A single holdout and repeated fold-based validation are alternative evaluation workflows."),
  edge("stratified-sampling", "train-validation-test-split", "uses", "Stratification is a way to construct a split while preserving label proportions."),
  edge("cross-validation", "train-validation-test-split", "contrasts_with", "Cross-validation rotates the validation role instead of fixing one validation subset."),
  edge("data-leakage", "train-validation-test-split", "contrasts_with", "A correct split protects against information bleed that would corrupt evaluation."),
  edge("preprocessing-pipeline", "data-leakage", "contrasts_with", "Pipelines are a standard way to keep fitted transforms from leaking across splits."),
  edge("preprocessing-pipeline", "feature-scaling", "uses", "Scaling should usually live inside the pipeline so its statistics come from training data only."),
  edge("temporal-split", "stratified-sampling", "contrasts_with", "Time order can matter more than class-balance preservation in sequential data."),
  edge("temporal-split", "cross-validation", "contrasts_with", "Standard fold rotation can violate chronology in time-ordered problems."),
  edge("train-validation-test-split", "data-leakage", "prerequisite_of", "Understanding the split contract is the first step in spotting leakage."),
  edge("cross-validation", "linear-regression", "evaluates", "Cross-validation is often used to compare regression settings on limited data."),
  edge("cross-validation", "logistic-regression", "evaluates", "Repeated folds can estimate how stable a classifier is across partitions."),
  edge("temporal-split", "linear-regression", "evaluates", "Chronological evaluation is important when a regression task predicts the future from the past."),
  edge("features-and-targets", "linear-regression", "prerequisite_of", "A regression model needs clearly defined inputs and a numeric target."),
  edge("features-and-targets", "logistic-regression", "prerequisite_of", "A classification model also depends on a clean separation between inputs and labels."),
  edge("linear-regression", "logistic-regression", "contrasts_with", "One predicts continuous values while the other predicts class probability."),
  edge("logistic-regression", "linear-regression", "extension_of", "Logistic regression keeps a linear score but wraps it in a probability link function."),
  edge("linear-decision-boundary", "logistic-regression", "example_of", "Logistic regression induces a linear boundary when used for binary classification."),
  edge("gradient-descent", "linear-regression", "optimizes", "Gradient descent can minimize regression loss by iteratively updating coefficients."),
  edge("gradient-descent", "logistic-regression", "optimizes", "Logistic regression is often fit with gradient-based updates on classification loss."),
  edge("gradient-descent", "learning-rate", "uses", "Each gradient step is scaled by the learning rate."),
  edge("feature-scaling", "gradient-descent", "prerequisite_of", "Scaling often makes gradient-based training more stable and easier to tune."),
  edge("feature-scaling", "k-means", "prerequisite_of", "Distance-based clustering can be distorted when one feature dominates the scale."),
  edge("feature-scaling", "principal-component-analysis", "prerequisite_of", "PCA is variance-based, so inconsistent feature scales can dominate the components."),
  edge("regularization", "linear-regression", "regularizes", "Penalty terms can shrink regression coefficients and reduce overfitting."),
  edge("regularization", "logistic-regression", "regularizes", "Logistic models also use penalties to control coefficient size and stability."),
  edge("l1-vs-l2-regularization", "regularization", "extension_of", "The L1-versus-L2 comparison refines the broader idea of regularization into two common penalty families."),
  edge("linear-regression", "regularization", "prerequisite_of", "Regularized regression is easiest to understand after plain linear regression."),
  edge("overfitting-and-underfitting", "regularization", "prerequisite_of", "Regularization is motivated by the need to control overfitting."),
  edge("linear-decision-boundary", "decision-tree", "contrasts_with", "Trees create piecewise regions rather than a single flat separating surface."),
  edge("logistic-regression", "calibration", "prerequisite_of", "Calibration is most natural once a model produces class probabilities to inspect."),
  edge("gradient-descent", "loss-functions", "uses", "Gradient updates are computed from the chosen training loss."),
  edge("mean-squared-error", "linear-regression", "evaluates", "MSE is a standard metric and objective for numeric regression predictions."),
  edge("classification-accuracy", "logistic-regression", "evaluates", "Accuracy can score a classifier after probabilities are thresholded into labels."),
  edge("classification-accuracy", "decision-tree", "evaluates", "A decision tree used for classification can be summarized by accuracy on held-out data."),
  edge("precision-recall-f1", "logistic-regression", "evaluates", "These metrics are often more informative than accuracy when class balance is uneven."),
  edge("precision-recall-f1", "classification-accuracy", "contrasts_with", "Precision and recall expose different error types that a single accuracy score can hide."),
  edge("roc-auc", "logistic-regression", "evaluates", "A probabilistic linear classifier can be judged by how well it ranks positives above negatives."),
  edge("calibration", "logistic-regression", "evaluates", "Calibration checks whether predicted probabilities match observed frequencies."),
  edge("overfitting-and-underfitting", "bias-variance-tradeoff", "prerequisite_of", "The bias-variance lens helps explain why underfitting and overfitting arise."),
  edge("classification-accuracy", "random-forest", "evaluates", "A random forest used for classification can be summarized by accuracy on held-out data."),
  edge("precision-recall-f1", "random-forest", "evaluates", "These metrics remain useful when forest predictions are made on imbalanced classes."),
  edge("roc-auc", "random-forest", "evaluates", "Forest probability scores or vote fractions can be assessed by ranking quality."),
  edge("calibration", "classification-accuracy", "contrasts_with", "A classifier can label well at one threshold but still produce untrustworthy probabilities."),
  edge("mean-squared-error", "classification-accuracy", "contrasts_with", "Regression loss and classification accuracy answer different target types."),
  edge("bias-variance-tradeoff", "random-forest", "prerequisite_of", "Random forests are often motivated as a way to lower variance by averaging many trees."),
  edge("decision-tree", "supervised-learning", "uses", "A supervised tree learns split rules from labeled examples."),
  edge("decision-tree", "features-and-targets", "uses", "Tree splits are chosen from the available features while targeting a label or numeric response."),
  edge("decision-tree", "impurity-measures", "uses", "Impurity reduction guides which candidate split is chosen next."),
  edge("tree-depth-and-pruning", "decision-tree", "regularizes", "Depth limits and pruning restrain tree complexity to improve generalization."),
  edge("random-forest", "decision-tree", "extension_of", "A random forest extends one tree into an averaged ensemble of many trees."),
  edge("gradient-boosted-trees", "decision-tree", "extension_of", "Boosting builds a sequence of trees rather than relying on a single tree."),
  edge("gradient-boosted-trees", "random-forest", "contrasts_with", "Boosting fits trees sequentially, whereas random forests average many randomized trees in parallel."),
  edge("feature-importance", "decision-tree", "uses", "A single tree can summarize which features drove its most useful splits."),
  edge("feature-importance", "random-forest", "uses", "A forest can aggregate feature-importance scores across many trees."),
  edge("gradient-boosted-trees", "optimization", "uses", "Boosting fits each new tree to improve the current objective stage by stage."),
  edge("random-forest", "decision-tree", "uses", "A random forest is built from many individual decision trees."),
  edge("gradient-boosted-trees", "decision-tree", "uses", "Boosted ensembles use shallow decision trees as their base learners."),
  edge("impurity-measures", "random-forest", "prerequisite_of", "Forest trees still rely on split criteria such as Gini or entropy inside each tree."),
  edge("tree-depth-and-pruning", "gradient-boosted-trees", "regularizes", "Shallow trees and depth limits are an important regularization tool in boosting."),
  edge("clustering", "supervised-learning", "contrasts_with", "Clustering groups examples without label supervision."),
  edge("k-means", "clustering", "example_of", "K-means is a standard centroid-based clustering algorithm."),
  edge("hierarchical-clustering", "clustering", "example_of", "Hierarchical methods are another common way to organize unlabeled examples into groups."),
  edge("k-means", "hierarchical-clustering", "contrasts_with", "K-means returns one flat partition, while hierarchical clustering reveals nested group structure."),
  edge("dimensionality-reduction", "principal-component-analysis", "prerequisite_of", "PCA is easiest to place once the broader goal of dimensionality reduction is clear."),
  edge("principal-component-analysis", "dimensionality-reduction", "example_of", "PCA is a classic linear dimensionality-reduction method."),
  edge("anomaly-detection", "clustering", "uses", "Cluster structure can help define what looks normal and what stands apart."),
  edge("unsupervised-learning", "clustering", "prerequisite_of", "Clustering is a central unsupervised learning task."),
  edge("unsupervised-learning", "dimensionality-reduction", "prerequisite_of", "Dimensionality reduction is another standard unsupervised learning objective."),
  edge("neural-networks-preview", "logistic-regression", "extension_of", "A neural network can be seen as a richer extension of the same probability-modeling idea."),
  edge("neural-networks-preview", "gradient-descent", "uses", "Neural networks are usually trained with gradient-based optimization."),
  edge("neural-networks-preview", "parameters-and-hyperparameters", "uses", "Neural models still distinguish learned weights from chosen architectural and training settings."),
  edge("neural-networks-preview", "decision-tree", "contrasts_with", "Neural networks learn layered continuous transformations instead of rule-based recursive splits."),
  edge("neural-networks-preview", "feature-scaling", "uses", "Stable neural optimization usually benefits from sensible feature scaling."),
] satisfies GraphEdge[];

const starterPaths = [
  {
    id: "absolute-beginner",
    title: "Absolute Beginner",
    summary:
      "Start with the supervised setup, honest splitting, a linear baseline, and one tree-based model.",
    nodeIds: [
      "dataset",
      "features-and-targets",
      "supervised-learning",
      "train-validation-test-split",
      "linear-regression",
      "mean-squared-error",
      "overfitting-and-underfitting",
      "decision-tree",
    ],
  },
  {
    id: "math-refresh",
    title: "Math Refresh",
    summary:
      "Revisit objectives, gradients, scaling, and PCA before moving back into richer models.",
    nodeIds: [
      "features-and-targets",
      "loss-functions",
      "optimization",
      "linear-regression",
      "gradient-descent",
      "learning-rate",
      "feature-scaling",
      "principal-component-analysis",
    ],
  },
  {
    id: "interview-oriented",
    title: "Interview Oriented",
    summary:
      "Cover leakage, validation, model control, practical metrics, and the two most common tree ensembles.",
    nodeIds: [
      "train-validation-test-split",
      "data-leakage",
      "cross-validation",
      "regularization",
      "bias-variance-tradeoff",
      "precision-recall-f1",
      "random-forest",
      "gradient-boosted-trees",
      "calibration",
    ],
  },
] satisfies StarterPath[];

export const mlFundamentalsModuleOrder = [
  "Foundations",
  "Data Splits and Leakage",
  "Linear Models and Optimization",
  "Evaluation and Generalization",
  "Trees and Ensembles",
  "Unsupervised Learning",
  "Neural Networks (Preview)",
] satisfies Module[];

export const DEFAULT_ML_NODE_ID = "linear-regression";

export const mlFundamentalsGraph = KnowledgeGraphSchema.parse({
  id: "ml-fundamentals",
  title: "ML Fundamentals",
  description:
    "A curated curriculum pack for core machine learning concepts, evaluation, and model families.",
  nodes,
  edges,
  starterPaths,
});

export const mlFundamentalsNodes = mlFundamentalsGraph.nodes;
export const mlFundamentalsEdges = mlFundamentalsGraph.edges;
export const mlFundamentalsStarterPaths = mlFundamentalsGraph.starterPaths;

export function getMlNode(nodeId: string) {
  return mlFundamentalsNodes.find((node) => node.id === nodeId);
}

export function getConnectedEdges(nodeId: string) {
  return mlFundamentalsEdges.filter(
    (edgeItem) => edgeItem.source === nodeId || edgeItem.target === nodeId,
  );
}

export function getConnectedNodeIds(nodeId: string) {
  return Array.from(
    new Set(
      getConnectedEdges(nodeId).flatMap((edgeItem) => [
        edgeItem.source,
        edgeItem.target,
      ]),
    ),
  );
}

export function getStarterPath(pathId: StarterPath["id"]) {
  return mlFundamentalsStarterPaths.find((path) => path.id === pathId);
}

export function getNodesForStarterPath(pathId: StarterPath["id"]) {
  const path = getStarterPath(pathId);

  if (!path) {
    return [];
  }

  return path.nodeIds
    .map((nodeId) => getMlNode(nodeId))
    .filter((node): node is CurriculumNode => Boolean(node));
}

export function getNodesByModule(module: Module) {
  return mlFundamentalsNodes.filter((node) => node.module === module);
}
